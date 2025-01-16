from os.path import basename

from django.contrib import admin
from django.urls import path,include
from quanlychungcu.admin import admin_site
from rest_framework.routers import DefaultRouter
from . import views

r = DefaultRouter()
r.register('phieudongtiens',views.PhieuDongTienViewSet,basename='phieudongtien')
r.register('user',views.NguoiDungViewSet,basename='user')
r.register('thegiuxes',views.TheGiuXeViewSet,basename='thegiuxe')
r.register('thongtinchuyentiens',views.ThongTinChuyenTienViewSet,basename='thongtinchuyentien')

urlpatterns = [

    path('', include(r.urls)),
]