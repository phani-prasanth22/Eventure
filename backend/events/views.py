from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics, permissions
from .models import Event
from .serializers import EventSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAdminUser
from datetime import datetime



class EventListCreateView(generics.ListAPIView):
    queryset = Event.objects.filter(status='approved')
    serializer_class = EventSerializer


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