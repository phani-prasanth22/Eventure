from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
import csv
from datetime import date
from .models import Registration
from .serializers import RegistrationSerializer, CheckInSerializer
from .utils import generate_registration_qr
from .services import perform_checkin, get_checkin_stats, search_registration
from .permissions import IsOrganizerOrAdmin
from events.models import Event


class RegistrationCreateView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        event_id = request.data.get('event')

        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if event.status != 'approved':
            return Response(
                {'error': 'You can only register for approved events'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if event.registrations.filter(status='registered').count() >= event.max_capacity:
            return Response(
                {'error': 'This event is full'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if date.today() > event.registration_deadline:
            return Response(
                {'error': 'Registration deadline has passed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Return existing registration if already registered
        if Registration.objects.filter(user=request.user, event=event).exists():
            existing = Registration.objects.get(user=request.user, event=event)
            return Response(
                RegistrationSerializer(existing, context={'request': request}).data,
                status=status.HTTP_200_OK
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        registration = serializer.save(user=request.user)

        generate_registration_qr(registration)
        registration.save()

        return Response(
            RegistrationSerializer(registration, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class MyRegistrationsView(generics.ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class EventAttendeeListView(generics.ListAPIView):
    """
    Accessible by: admin, organizer, assigned team members
    """
    serializer_class = RegistrationSerializer
    permission_classes = [IsOrganizerOrAdmin]

    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return Registration.objects.filter(event_id=event_id)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class DownloadAttendeesCSVView(generics.GenericAPIView):
    """
    Accessible by: admin, organizer, assigned team members
    """
    permission_classes = [IsOrganizerOrAdmin]

    def get(self, request, event_id):
        registrations = Registration.objects.filter(event_id=event_id)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = (
            f'attachment; filename="event_{event_id}_attendees.csv"'
        )
        writer = csv.writer(response)
        writer.writerow([
            'Full Name', 'Email', 'Phone', 'College',
            'Year', 'Status', 'Checked In', 'Checked In At', 'Registered At'
        ])
        for reg in registrations:
            writer.writerow([
                reg.full_name, reg.email, reg.phone, reg.college,
                reg.year, reg.status,
                'Yes' if reg.checked_in else 'No',
                reg.checked_in_at or '',
                reg.registered_at,
            ])
        return response


class CheckInView(APIView):
    """
    Single endpoint for both camera and USB QR scanner check-in.
    Accessible by: admin, organizer, assigned team members.
    POST /api/registrations/event/<event_id>/checkin/
    Body: { "qr_data": "<scanned string>" }
    """
    permission_classes = [IsOrganizerOrAdmin]

    def post(self, request, event_id):
        qr_data = request.data.get('qr_data', '').strip()

        if not qr_data:
            return Response(
                {'status': 'invalid_qr', 'message': 'No QR data received.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        success, code, data = perform_checkin(qr_data, event_id, request.user)

        if code == 'success':
            return Response({
                'status': 'success',
                'message': 'Check-in successful.',
                'registration': CheckInSerializer(
                    data['registration'],
                    context={'request': request}
                ).data,
                'stats': get_checkin_stats(event_id),
            }, status=status.HTTP_200_OK)

        if code == 'already_checked':
            return Response({
                'status': 'already_checked',
                'message': 'This attendee has already checked in.',
                'registration': CheckInSerializer(
                    data['registration'],
                    context={'request': request}
                ).data,
                'stats': get_checkin_stats(event_id),
            }, status=status.HTTP_200_OK)

        return Response({
            'status': code,
            'message': data['message'],
        }, status=status.HTTP_400_BAD_REQUEST)


class CheckInStatsView(APIView):
    """
    GET /api/registrations/event/<event_id>/checkin/stats/
    Accessible by: admin, organizer, assigned team members.
    """
    permission_classes = [IsOrganizerOrAdmin]

    def get(self, request, event_id):
        return Response(get_checkin_stats(event_id))


class CheckInSearchView(APIView):
    """
    POST /api/registrations/event/<event_id>/checkin/search/
    Fallback search for damaged QR codes.
    Accessible by: admin, organizer, assigned team members.
    """
    permission_classes = [IsOrganizerOrAdmin]

    def post(self, request, event_id):
        query = request.data.get('query', '').strip()
        if not query or len(query) < 2:
            return Response(
                {'error': 'Search query must be at least 2 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        registrations = search_registration(event_id, query)
        return Response(
            CheckInSerializer(
                registrations, many=True, context={'request': request}
            ).data
        )


class ManualCheckInView(APIView):
    """
    POST /api/registrations/event/<event_id>/checkin/manual/
    Manual check-in after fallback search.
    Accessible by: admin, organizer, assigned team members.
    """
    permission_classes = [IsOrganizerOrAdmin]

    def post(self, request, event_id):
        registration_id = request.data.get('registration_id')
        if not registration_id:
            return Response(
                {'error': 'registration_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        import json
        try:
            reg = Registration.objects.get(id=registration_id, event_id=event_id)
        except Registration.DoesNotExist:
            return Response(
                {'status': 'not_found', 'message': 'Registration not found.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        qr_data = json.dumps({
            'registration_id': reg.id,
            'event_id': reg.event_id,
            'user_id': reg.user_id,
            'full_name': reg.full_name,
            'email': reg.email,
            'status': reg.status,
        })

        success, code, data = perform_checkin(qr_data, event_id, request.user)

        if code in ('success', 'already_checked'):
            return Response({
                'status': code,
                'message': 'Check-in successful.' if code == 'success' else 'Already checked in.',
                'registration': CheckInSerializer(
                    data['registration'],
                    context={'request': request}
                ).data,
                'stats': get_checkin_stats(event_id),
            }, status=status.HTTP_200_OK)

        return Response({
            'status': code,
            'message': data['message'],
        }, status=status.HTTP_400_BAD_REQUEST)