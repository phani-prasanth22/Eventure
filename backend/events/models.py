from django.db import models
from django.contrib.auth.models import User


class Event(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    venue = models.CharField(max_length=200)

    event_date = models.DateField()
    event_time = models.TimeField()
    registration_deadline = models.DateField()

    max_capacity = models.PositiveIntegerField()
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    banner = models.ImageField(upload_to='event_banners/', blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    rejection_reason = models.TextField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class EventTeam(models.Model):
    ROLE_CHOICES = [
        ("volunteer", "Volunteer"),
        ("lead", "Lead"),
    ]

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="team_members",
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="assigned_events",
    )

    added_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="team_members_added",
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="volunteer",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("event", "user")
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.user.username} ({self.role}) - {self.event.title}"