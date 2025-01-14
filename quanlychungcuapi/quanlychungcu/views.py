from django.core.serializers import serialize
from rest_framework import generics, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from quanlychungcu import serializers
from quanlychungcu.models import PhieuDongTien, NguoiDung


class PhieuDongTienViewSet(viewsets.ViewSet,generics.ListAPIView):
    queryset = PhieuDongTien.objects.filter(active=True).all()
    serializer_class = serializers.PhieuDOngTienSerializer

class NguoiDungViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = NguoiDung.objects.filter(is_active=True).all()
    serializer_class = serializers.UserSerializer

