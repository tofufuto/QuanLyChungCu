from datetime import datetime, timezone
from tkinter.constants import CASCADE

from cloudinary import CloudinaryImage
from cloudinary.models import CloudinaryField
from django.db import models
from django.contrib.auth.models import AbstractUser
from quanlychungcu import PhieuStatus, PhanAnhStatus
from django.utils.timezone import now
from django.utils import timezone


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(default=datetime.now())
    update_date = models.DateTimeField(default=datetime.now())

    class Meta:
        abstract = True

class Phong(BaseModel):
    so_phong = models.CharField(max_length=255,unique=True)

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
     phong = models.OneToOneField(Phong,null=True,on_delete=models.PROTECT,blank=True)

     class Meta:
         verbose_name = "Tài khoảng"
         verbose_name_plural = "Tài khoảng"

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
    status = models.CharField(max_length=255,null=False,default=PhanAnhStatus.WAITING.value)

class HinhAnhPhanAnh (BaseModel):
    phan_anh = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, null=False, related_name='hinh_anhs')
    image = CloudinaryField('image',blank=True,null=True)

class TuDoDienTu(BaseModel):
    ten_do = models.CharField(max_length=255)
    mo_ta = models.CharField(max_length=255)
    nguoi_dung = models.ForeignKey(NguoiDung,on_delete=models.PROTECT,null=False,related_name='tu_dos')

class LuaChon(BaseModel):
    ten_lua_chon = models.CharField(max_length=255)

    def __str__(self):
        return self.ten_lua_chon

class KhaoSat(BaseModel):
    ngay_han = models.DateTimeField(null=True)

class NoiDungChiTietKhaoSat(BaseModel):
    noi_dung = models.TextField(null=False)

class ChiTietKhaoSat(BaseModel):
    noi_dung = models.TextField(null=False)
    khao_sat = models.ForeignKey(KhaoSat,on_delete=models.CASCADE,null=False,related_name='khao_sats')
    lua_chon = models.ForeignKey(LuaChon,on_delete=models.PROTECT,null=True,blank=True,related_name='chi_tiet_khao_sats')


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
