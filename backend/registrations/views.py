from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.http import HttpResponse
import csv
from datetime import date
from .models import Registration
from .serializers import RegistrationSerializer
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

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyRegistrationsView(generics.ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user)


class EventAttendeeListView(generics.ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return Registration.objects.filter(event_id=event_id)


class DownloadAttendeesCSVView(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, event_id):
        registrations = Registration.objects.filter(event_id=event_id)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="event_{event_id}_attendees.csv"'

        writer = csv.writer(response)
        writer.writerow(['Full Name', 'Email', 'Phone', 'College', 'Year', 'Status', 'Registered At'])

        for reg in registrations:
            writer.writerow([
                reg.full_name,
                reg.email,
                reg.phone,
                reg.college,
                reg.year,
                reg.status,
                reg.registered_at,
            ])

        return response