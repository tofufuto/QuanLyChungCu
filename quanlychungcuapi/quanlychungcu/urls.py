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
r.register('tudodientus',views.TuDoDienTuViewSet,basename='tudodientu')
r.register('phananhs',views.PhanAnhViewSet,basename='phananh')
r.register('khaosats',views.KhaoSatViewSet,basename='khaosat')

urlpatterns = [

    path('', include(r.urls)),
    path('vnpay_return/', views.vnpay_return, name='vnpay_return'),
]