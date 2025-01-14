from django.contrib import admin
from django.urls import path,include
from quanlychungcu.admin import admin_site
from rest_framework.routers import DefaultRouter
from . import views

r = DefaultRouter()
r.register('phieudongtiens',views.PhieuDongTienViewSet,basename='phieu')
r.register('nguoidungs', views.NguoiDungViewSet, basename='user')

urlpatterns = [

    path('', include(r.urls)),
]