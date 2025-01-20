from datetime import datetime

from django.core.serializers import serialize
from django.http.multipartparser import MultiPartParser
from oauthlib.uri_validate import query
from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from quanlychungcu import serializers
from quanlychungcu.models import PhieuDongTien, NguoiDung, TheGiuXeNguoiThan, ThongTinChuyenTien
from quanlychungcu.serializers import PhieuDongTienChiTietSerializer, PhieuDongTienSerializer


class PhieuDongTienPagination(PageNumberPagination):
    page_size = 5  # Số lượng bản ghi trên mỗi trang
    page_size_query_param = 'page_size'  # Cho phép client tùy chỉnh số lượng bản ghi mỗi trang
    max_page_size = 5  # Giới hạn tối đa số bản ghi mỗi trang

class PhieuDongTienViewSet(viewsets.ViewSet,generics.ListAPIView,generics.RetrieveAPIView,generics.RetrieveUpdateAPIView):
    queryset = PhieuDongTien.objects.filter(active=True).all()
    # serializer_class = serializers.PhieuDongTienSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PhieuDongTienPagination

    def get_queryset(self):
        # Lọc các bản ghi PhieuDongTien cho người dùng hiện tại
        return PhieuDongTien.objects.filter(active=True, nguoi_dung=self.request.user).order_by('-id')

    def retrieve(self, request, *args, **kwargs):
        # Lấy một Phiếu đóng tiền cho người dùng hiện tại
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_serializer_class(self):
        # Dùng serializer khác nhau cho list và retrieve
        if self.action == 'retrieve':
            return PhieuDongTienChiTietSerializer
        return PhieuDongTienSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Kiểm tra xem phiếu có thuộc về user hiện tại không
        if instance.nguoi_dung != request.user:
            return Response({"error": "Invalid Authorization."}, status=status.HTTP_403_FORBIDDEN)

        # Chỉ cập nhật screenshot_xac_nhan
        file = request.FILES.get('screenshot_xac_nhan')
        if file:
            instance.screenshot_xac_nhan = file
            instance.save()
            return Response(
                {"message": "Cập nhật thành công!", "screenshot_xac_nhan": instance.screenshot_xac_nhan.url},
                status=status.HTTP_200_OK)
        else:
            return Response({"error": "Vui lòng cung cấp tệp hình ảnh."}, status=status.HTTP_400_BAD_REQUEST)




class NguoiDungViewSet(viewsets.ViewSet,generics.ListAPIView,generics.UpdateAPIView):
    queryset = NguoiDung.objects.filter(is_active=True).all()
    serializer_class = serializers.NguoiDungSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return NguoiDung.objects.filter(is_active=True,id=self.request.user.id)

    def update(self, request, *args, **kwargs):
        # Lấy đối tượng người dùng hiện tại (sau khi kiểm tra quyền sở hữu)
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

class TheGiuXeViewSet(viewsets.ViewSet,generics.ListAPIView,generics.CreateAPIView,generics.RetrieveAPIView,generics.DestroyAPIView):
    queryset = TheGiuXeNguoiThan.objects.filter(active=True).all()
    serializer_class = serializers.TheGiuXeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Lọc các bản ghi TheGiuXe cho người dùng hiện tại
        return TheGiuXeNguoiThan.objects.filter(active=True, nguoi_dung=self.request.user)

    def create(self, request, *args, **kwargs):
        # Lấy dữ liệu từ request
        data = request.data.copy()  # Tạo bản sao để tránh sửa đổi trực tiếp
        data['nguoi_dung'] = self.request.user.id  # Gắn ID người dùng hiện tại
        data['created_date'] = datetime.now()

        # Sử dụng serializer để validate và tạo đối tượng
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Trả về phản hồi
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        instance.active = False
        instance.save()

        super().perform_destroy(instance)

class ThongTinChuyenTienViewSet(viewsets.ViewSet,generics.ListAPIView):
    queryset = ThongTinChuyenTien.objects.filter(active=True).all()
    serializer_class = serializers.ThongTinCHuyenTienSerializer
    permission_classes = [permissions.IsAuthenticated]

