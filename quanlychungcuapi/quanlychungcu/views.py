from datetime import datetime

from django.core.serializers import serialize
from django.http import JsonResponse
from django.http.multipartparser import MultiPartParser
from django.views.decorators.csrf import csrf_exempt
from oauthlib.uri_validate import query
from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from quanlychungcu import serializers, VNP_HASHSECRET, PhieuStatus
from quanlychungcu.models import PhieuDongTien, NguoiDung, TheGiuXeNguoiThan, ThongTinChuyenTien, KhaoSat, TraLoi, \
    TuDoDienTu, PhanAnh, ChiTietKhaoSat
from quanlychungcu.serializers import PhieuDongTienChiTietSerializer, PhieuDongTienSerializer, TraLoiSerializer
from quanlychungcu.vnpay import vnpay


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

@csrf_exempt
def vnpay_return(request):
    inputData = request.GET
    if inputData:
        vnp = vnpay()
        vnp.responseData = inputData.dict()
        order_id = inputData['vnp_TxnRef']
        amount = int(inputData['vnp_Amount']) / 100
        order_desc = inputData['vnp_OrderInfo']
        vnp_TransactionNo = inputData['vnp_TransactionNo']
        vnp_ResponseCode = inputData['vnp_ResponseCode']
        vnp_TmnCode = inputData['vnp_TmnCode']
        vnp_PayDate = inputData['vnp_PayDate']
        vnp_BankCode = inputData['vnp_BankCode']
        vnp_CardType = inputData['vnp_CardType']
        if vnp.validate_response(VNP_HASHSECRET):
            if vnp_ResponseCode == "00":
                phieu = PhieuDongTien.objects.get(id=order_id)
                # Cập nhật trạng thái phiếu đóng tiền thành approved
                phieu.status = PhieuStatus.APPROVED.value  # Cập nhật trạng thái là approved
                phieu.save()  # Lưu thay đổi vào cơ sở dữ liệu
                return JsonResponse({
                "message": "Thanh toán thành công!",
                "data": {
                    "amount": amount,
                    "order_id": order_id,
                }
            })
            else:
                return JsonResponse({"message": "Thanh toán thất bại, vui lòng thử lại.","error_code": vnp_ResponseCode}, status=400)


class NguoiDungViewSet(viewsets.ViewSet,generics.ListAPIView,generics.UpdateAPIView,generics.RetrieveAPIView):
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

class KhaoSatPagination(PageNumberPagination):
    page_size = 5  # Số lượng bản ghi trên mỗi trang
    page_size_query_param = 'page_size'  # Cho phép client tùy chỉnh số lượng bản ghi mỗi trang
    max_page_size = 5  # Giới hạn tối đa số bản ghi mỗi trang

class KhaoSatViewSet(viewsets.ViewSet,generics.ListAPIView,generics.RetrieveAPIView):
    queryset = KhaoSat.objects.filter(active=True).all()
    serializer_class = serializers.KhaoSatSerializer
    permission_classes =[permissions.IsAuthenticated]
    pagination_class = KhaoSatPagination

class TraLoiViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data  # Lấy dữ liệu từ request

        if not isinstance(data, list):
            return Response({"error": "Expected a list of answers"}, status=status.HTTP_400_BAD_REQUEST)

        saved_answers = []
        for answer_data in data:
            chi_tiet_khao_sat_id = answer_data.get('chi_tiet_khao_sat')
            tra_loi_text = answer_data.get('tra_loi')

            if not chi_tiet_khao_sat_id or not tra_loi_text:
                return Response({"error": "Missing 'chi_tiet_khao_sat' or 'tra_loi'"}, status=status.HTTP_400_BAD_REQUEST)
            if tra_loi_text != 'Đồng ý' and tra_loi_text != 'Không đồng ý' and tra_loi_text != 'Bình thường':
                return Response({"error": "Missing Invalid 'tra_loi' data"},
                                status=status.HTTP_400_BAD_REQUEST)

            try:
                chi_tiet_khao_sat = ChiTietKhaoSat.objects.get(id=chi_tiet_khao_sat_id)
            except ChiTietKhaoSat.DoesNotExist:
                return Response({"error": f"Question ID {chi_tiet_khao_sat_id} does not exist"}, status=status.HTTP_400_BAD_REQUEST)

            # Tạo đối tượng TraLoi
            tra_loi_instance = TraLoi.objects.create(
                nguoi_dung=request.user,
                chi_tiet_khao_sat=chi_tiet_khao_sat,
                tra_loi=tra_loi_text
            )

            # Lưu câu trả lời
            saved_answers.append(TraLoiSerializer(tra_loi_instance).data)

        return Response(saved_answers, status=status.HTTP_201_CREATED)


class TuDoDienTuViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = TuDoDienTu.objects.filter(active=True).all()
    serializer_class = serializers.TuDoDienTuSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Kiểm tra request.user
        if not request.user or request.user.is_anonymous:
            return Response({"error": "User authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        # Gán các giá trị từ request, mặc định 'trang_thai' là 'empty'
        data = request.data.copy()
        data['nguoi_dung'] = request.user.id  # Gán ID người dùng hiện tại
        data['created_date'] = datetime.now()

        # Nếu không truyền 'trang_thai', mặc định sẽ là 'empty'
        if 'trang_thai' not in data:
            data['trang_thai'] = 'empty'

        # Sử dụng serializer để lưu dữ liệu
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()  # Lưu dữ liệu
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PhanAnhViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Chỉ lấy phản ánh của người dùng hiện tại.
        """
        return PhanAnh.objects.filter(nguoi_dung=self.request.user)

    def get_serializer_class(self):
        """
        Dùng serializer phù hợp cho từng loại request:
        - `POST`: Dùng `PhanAnhCreateSerializer` để hỗ trợ danh sách ảnh
        - `GET`: Dùng `PhanAnhSerializer` (không lấy ảnh trong list API)
        """
        if self.action == 'create':
            return serializers.PhanAnhCreateSerializer
        return serializers.PhanAnhSerializer

    def perform_create(self, serializer):
        """
        Tạo phản ánh với người dùng hiện tại.
        """
        serializer.save(nguoi_dung=self.request.user)
