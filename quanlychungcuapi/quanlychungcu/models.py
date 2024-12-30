from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_noew_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True