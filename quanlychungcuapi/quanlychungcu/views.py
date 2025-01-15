from django.core.serializers import serialize
from django.http.multipartparser import MultiPartParser
from oauthlib.uri_validate import query
from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from quanlychungcu import serializers
from quanlychungcu.models import PhieuDongTien, NguoiDung


class PhieuDongTienViewSet(viewsets.ViewSet,generics.ListAPIView):
    queryset = PhieuDongTien.objects.filter(active=True).all()
    serializer_class = serializers.PhieuDOngTienSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Lọc các bản ghi PhieuDongTien cho người dùng hiện tại
        return PhieuDongTien.objects.filter(active=True, nguoi_dung=self.request.user)


class NguoiDungViewSet(viewsets.ViewSet,generics.RetrieveAPIView,generics.UpdateAPIView):
    queryset = NguoiDung.objects.filter(is_active=True).all()
    serializer_class = serializers.NguoiDungSerializer


    def get_permissions(self):
        if self.action in ['retrieve','update'] :
            return  [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    def update(self, request, *args, **kwargs):
        # Lấy đối tượng người dùng hiện tại
        user = self.get_object()

        # Cập nhật mật khẩu nếu có trong request
        password = request.data.get('password')
        if password:
            user.set_password(password)

        # Cập nhật avatar nếu có trong request
        avatar = request.data.get('avatar')
        if avatar:
            user.avatar = avatar  # Giả sử trường avatar là một ImageField

        # Lưu các thay đổi
        user.save()

        # Trả về phản hồi với serializer
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


