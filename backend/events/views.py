from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics, permissions
from .models import Event
from .serializers import EventSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAdminUser
from datetime import datetime
from django.utils import timezone

from django.shortcuts import get_object_or_404

from .models import Event, EventTeam
from .serializers import (
    EventSerializer,
    EventTeamSerializer,
    AddTeamMemberSerializer,
)
from .services import (
    add_team_member,
    get_team_members,
    remove_team_member,
    get_assigned_events,
)
from .permissions import IsOrganizerOrAdmin

class EventListCreateView(generics.ListAPIView):
    serializer_class = EventSerializer

    def get_queryset(self):
        now = timezone.now()
        return Event.objects.filter(
            status='approved',
            # Exclude events where date+time has already passed
            # We filter by date first for index efficiency,
            # then exclude same-day events that have already ended
        ).exclude(
            # Events that ended on a previous day
            event_date__lt=now.date()
        ).exclude(
            # Events that end today but time has already passed
            event_date=now.date(),
            event_time__lt=now.time()
        )
    


class EventDetailView(generics.RetrieveAPIView):
    serializer_class = EventSerializer
    queryset = Event.objects.all()
    lookup_field = 'pk'


class UserEventCreateView(generics.CreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        print("RAW REQUEST DATA:", dict(data))

        # Accept both frontend aliases and real model field names
        event_date = data.get('event_date') or data.get('date')
        venue = data.get('venue') or data.get('location')
        max_capacity = data.get('max_capacity') or data.get('capacity')
        ticket_price = data.get('ticket_price') or data.get('price') or 0
        registration_deadline = data.get('registration_deadline')

        # Parse time — handle "09:00 AM", "09:00", "09:00:00"
        raw_time = data.get('event_time') or data.get('time')
        event_time = None
        if raw_time:
            from datetime import datetime
            for fmt in ('%H:%M:%S', '%H:%M', '%I:%M %p', '%I:%M%p'):
                try:
                    event_time = datetime.strptime(raw_time, fmt).strftime('%H:%M:%S')
                    break
                except ValueError:
                    continue
            if not event_time:
                event_time = raw_time  # pass as-is and let Django validate

        # Validate required fields
        missing = []
        if not data.get('title'): missing.append('title')
        if not event_date: missing.append('event_date')
        if not event_time: missing.append('event_time')
        if not venue: missing.append('venue')
        if not max_capacity: missing.append('max_capacity')
        if not data.get('category'): missing.append('category')
        if not registration_deadline: missing.append('registration_deadline')

        if missing:
            return Response(
                {'error': f'Missing required fields: {", ".join(missing)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            event = Event.objects.create(
                title=data.get('title'),
                description=data.get('description', ''),
                category=data.get('category'),
                venue=venue,
                event_date=event_date,
                event_time=event_time,
                registration_deadline=registration_deadline,
                max_capacity=int(max_capacity),
                ticket_price=float(ticket_price),
                status='pending',
                created_by=request.user,
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            EventSerializer(event, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

class MyCreatedEventsView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(created_by=self.request.user)


class AdminAllEventsView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Event.objects.all()


class AdminEventStatusUpdateView(generics.UpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, *args, **kwargs):
        event = self.get_object()
        new_status = request.data.get('status')

        if new_status not in ['approved', 'rejected', 'cancelled']:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        event.status = new_status

        if new_status == 'rejected':
            event.rejection_reason = request.data.get('rejection_reason', '')
        elif new_status == 'cancelled':
            event.cancellation_reason = request.data.get('cancellation_reason', '')

        event.save()
        return Response(EventSerializer(event, context={'request': request}).data,
                        status=status.HTTP_200_OK)
        
class EventTeamView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddTeamMemberSerializer

    def get_event(self, event_id):
        return get_object_or_404(Event, pk=event_id)

    def get(self, request, event_id):
        event = self.get_event(event_id)

        permission = IsOrganizerOrAdmin()
        if not permission.has_object_permission(request, self, event):
            return Response(
                {"detail": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN,
            )

        members = get_team_members(event)

        serializer = EventTeamSerializer(members, many=True)

        return Response(serializer.data)

    def post(self, request, event_id):
        event = self.get_event(event_id)

        permission = IsOrganizerOrAdmin()
        if not permission.has_object_permission(request, self, event):
            return Response(
                {"detail": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            member = add_team_member(
                event=event,
                email=serializer.validated_data["email"],
                added_by=request.user,
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except PermissionError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            EventTeamSerializer(member).data,
            status=status.HTTP_201_CREATED,
        )
class EventTeamDetailView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, event_id, member_id):
        event = get_object_or_404(Event, pk=event_id)

        permission = IsOrganizerOrAdmin()
        if not permission.has_object_permission(request, self, event):
            return Response(
                {"detail": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            remove_team_member(
                event=event,
                member_id=member_id,
                removed_by=request.user,
            )
        except EventTeam.DoesNotExist:
            return Response(
                {"detail": "Team member not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except PermissionError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class MyAssignedEventsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EventSerializer

    def get_queryset(self):
        return get_assigned_events(self.request.user)