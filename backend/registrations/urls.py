from django.urls import path
from .views import (
    RegistrationCreateView,
    MyRegistrationsView,
    EventAttendeeListView,
    DownloadAttendeesCSVView,
)

urlpatterns = [
    path('register/', RegistrationCreateView.as_view(), name='event-register'),
    path('my-registrations/', MyRegistrationsView.as_view(), name='my-registrations'),
    path('event/<int:event_id>/attendees/', EventAttendeeListView.as_view(), name='event-attendees'),
    path('event/<int:event_id>/attendees/download/', DownloadAttendeesCSVView.as_view(), name='download-attendees'),
]