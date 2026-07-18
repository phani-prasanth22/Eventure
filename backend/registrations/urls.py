from django.urls import path
from .views import (
    RegistrationCreateView,
    MyRegistrationsView,
    EventAttendeeListView,
    DownloadAttendeesCSVView,
    CheckInView,
    CheckInStatsView,
    CheckInSearchView,
    ManualCheckInView,
)

urlpatterns = [
    path('register/', RegistrationCreateView.as_view(), name='event-register'),
    path('my-registrations/', MyRegistrationsView.as_view(), name='my-registrations'),
    path('event/<int:event_id>/attendees/', EventAttendeeListView.as_view(), name='event-attendees'),
    path('event/<int:event_id>/attendees/download/', DownloadAttendeesCSVView.as_view(), name='download-attendees'),
    path('event/<int:event_id>/checkin/', CheckInView.as_view(), name='event-checkin'),
    path('event/<int:event_id>/checkin/stats/', CheckInStatsView.as_view(), name='checkin-stats'),
    path('event/<int:event_id>/checkin/search/', CheckInSearchView.as_view(), name='checkin-search'),
    path('event/<int:event_id>/checkin/manual/', ManualCheckInView.as_view(), name='checkin-manual'),
]