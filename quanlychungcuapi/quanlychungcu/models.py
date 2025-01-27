from datetime import datetime, timezone
from tkinter.constants import CASCADE

from cloudinary import CloudinaryImage
from cloudinary.models import CloudinaryField
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import Model


from quanlychungcu import PhieuStatus, PhanAnhStatus
from django.utils.timezone import now
from django.utils import timezone
from ckeditor.fields import RichTextField


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(default=datetime.now())
    update_date = models.DateTimeField(default=datetime.now())

    class Meta:
        abstract = True

class Phong(BaseModel):
    so_phong = models.CharField(max_length=255,unique=True)
    nguoi_dung = models.OneToOneField('NguoiDung',null=True,on_delete=models.PROTECT,blank=True,related_name='phong')
    def __str__(self):
        return self.so_phong

    class Meta:
        verbose_name = "Phòng"
        verbose_name_plural = "Phòng"

class NguoiDung(AbstractUser):
     avatar = CloudinaryField('avatar',blank=True,null=True)
     sdt = models.CharField(max_length=10)
     cccd = models.CharField(max_length=12)
     birthdate = models.DateField(default=now)
     thong_bao = models.BooleanField(default=False, verbose_name="Thông báo đơn hàng")


     class Meta:
         verbose_name = "Tài khoản"
         verbose_name_plural = "Tài khoản"

class PhieuDongTien(BaseModel):
    nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, null=False)
    screenshot_xac_nhan = CloudinaryField('image',blank=True,null=True)

    class StatusChoices(models.TextChoices):
        WAITING = 'WAITING'
        APPROVED = 'APPROVED'
        REJECTED = 'REJECTED'

        # Sử dụng các lựa chọn trong trường status

    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.WAITING
    )

    class Meta:
        verbose_name = "Phiếu Đóng Tiền"
        verbose_name_plural = "Phiếu Đóng Tiền"

class ChiTietPhieuDongTien(BaseModel):
    phieu = models.ForeignKey(PhieuDongTien,on_delete=models.CASCADE,null=False,related_name='chitiet_phieudongtiens')
    ten_dich_vu = models.CharField(max_length=255, null=False,default='KHÁC')
    noi_dung = models.TextField(null=False)
    phi_dong = models.DecimalField(max_digits=12, decimal_places=2,null=False)

class TheGiuXeNguoiThan(BaseModel):
    nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, null=False)
    so_xe = models.CharField(max_length=255,null=False)
    ten_nguoi_than = models.CharField(max_length=255,null=False)

    class Meta:
        verbose_name = "Thẻ giữ xe cho người thân"
        verbose_name_plural = "Thẻ giữ xe cho người thân"

class PhanAnh(BaseModel):
    nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, null=False, related_name='phan_anhs')
    noi_dung = models.TextField(null=False)
    tieu_de = models.TextField(null=False)
    status = models.CharField(max_length=255, null=False, choices=PhanAnhStatus.CHOICES, default=PhanAnhStatus.WAITING)

class HinhAnhPhanAnh (BaseModel):
    phan_anh = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, null=False, related_name='hinh_anhs')
    image = CloudinaryField('image',blank=True,null=True)

class TuDoDienTu(BaseModel):
    ten_do = models.CharField(max_length=255)
    mo_ta = RichTextField()
    ngay_nhan_hang = models.DateTimeField(null=True, blank=True)
    trang_thai = models.CharField(max_length=50, choices=[
        ('empty', 'Trống'),
        ('stocked', 'Có hàng')
    ], default='empty', verbose_name="Trạng thái")
    nguoi_dung = models.ForeignKey(NguoiDung,on_delete=models.PROTECT,null=False,related_name='tu_dos')

class CauHoi(BaseModel):
    noi_dung_cau_hoi = RichTextField()
    khaosat = models.ForeignKey('KhaoSat',on_delete=models.CASCADE,null=False,related_name='cau_hois',verbose_name='Khảo sát')

    def __str__(self):
        return self.noi_dung_cau_hoi


class KhaoSat(models.Model):

    ngay_han= BaseModel.update_date =models.DateTimeField(null=True,verbose_name='Hạn chót khảo sát')
    ten_khao_sat = models.CharField(max_length=255,null=False,default='KhaoSat',verbose_name='Tên khảo sát')

class ThucHienKhaoSat(BaseModel):
    nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.PROTECT, null=False, related_name='nguoi_dung_khao_sats')
    noi_dung = models.TextField(null=False)
    khao_sat = models.ForeignKey(KhaoSat,on_delete=models.CASCADE,null=False,related_name='khao_sats')


class PhiCacDichVu(BaseModel):
    ten_dich_vu = models.CharField(max_length=255,null=False,default='KHÁC')
    noi_dung = models.TextField(null=False)
    phi_dong = models.DecimalField(max_digits=12, decimal_places=2, null=False)

    class Meta:
        verbose_name = "Các chi phí cho phiếu đóng tiền"
        verbose_name_plural = "Các chi phí cho phiếu đóng tiền"

class ThongTinChuyenTien(BaseModel):
    ngan_hang = models.CharField(max_length=255,null=False,default='KHÁC')
    so_tai_khoang = models.CharField(max_length=20, null=False,default='---')
    ten = models.CharField(max_length=255, null=False,default='TÊN')

    class Meta:
        verbose_name = "Thông tin chuyển tiền"
        verbose_name_plural = "Thông tin chuyển tiền"
