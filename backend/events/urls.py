from django.urls import path
from .views import (
    EventListCreateView,
    EventDetailView,
    UserEventCreateView,
    MyCreatedEventsView,
    AdminAllEventsView,
    AdminEventStatusUpdateView,
    EventTeamView,
    EventTeamDetailView,
    MyAssignedEventsView,
)

urlpatterns = [
    # Public Events
    path('', EventListCreateView.as_view(), name='event-list-create'),
    path('<int:pk>/', EventDetailView.as_view(), name='event-detail'),

    # Organizer
    path('create/', UserEventCreateView.as_view(), name='event-create'),
    path('my-events/', MyCreatedEventsView.as_view(), name='my-created-events'),

    # Event Team
    path('<int:event_id>/team/', EventTeamView.as_view(), name='event-team'),
    path(
        '<int:event_id>/team/<int:member_id>/',
        EventTeamDetailView.as_view(),
        name='event-team-detail'
    ),
    path(
        'my-assigned-events/',
        MyAssignedEventsView.as_view(),
        name='my-assigned-events'
    ),

    # Admin
    path('admin/all/', AdminAllEventsView.as_view(), name='admin-all-events'),
    path(
        'admin/<int:pk>/status/',
        AdminEventStatusUpdateView.as_view(),
        name='admin-event-status-update'
    ),
]