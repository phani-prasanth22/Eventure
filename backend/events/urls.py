from django.urls import path
from .views import (
    EventListCreateView,
    EventDetailView,
    UserEventCreateView,
    MyCreatedEventsView,
    AdminAllEventsView,
    AdminEventStatusUpdateView,
    )

urlpatterns = [
    path('', EventListCreateView.as_view(), name='event-list-create'),
    path('create/',UserEventCreateView.as_view(),name='event-create'),
    path('<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    path('my-events/',MyCreatedEventsView.as_view(),name='my-created-events'),
    path('admin/all/',AdminAllEventsView.as_view(),name='admin-all-events'),
    path('admin/<int:pk>/status/',AdminEventStatusUpdateView.as_view(),name='admin-event-status-updates'),
]