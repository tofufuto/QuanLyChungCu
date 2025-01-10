from django import forms
from django.contrib import admin
from django.utils.html import format_html

from quanlychungcu.models import Phong, NguoiDung, PhieuDongTien, ChiTietPhieuDongTien, KhaoSat, ChiTietKhaoSat, \
    LuaChon, TuDoDienTu, PhanAnh, TheGiuXeNguoiThan, BaseModel, PhiCacDichVu

class MyAdminSite(admin.AdminSite):
    site_header = "Quản Lý Chung Cư"
    site_title = "Hệ Thống Quản Lý"
    index_title = "Trang quản trị hệ thống"


class AdminPhong(admin.ModelAdmin):
    list_display = ['id','so_phong','created_date']
    search_fields = ['so_phong']
    list_filter = ['created_date']
    readonly_fields = ['so_phong']

class NguoiDungForm(forms.ModelForm):
    class Meta:
        model = NguoiDung
        fields = '__all__'
        widgets = {
            'password': forms.PasswordInput(render_value=True),  # Dùng PasswordInput
        }

class AdminNguoiDung(admin.ModelAdmin):
    form = NguoiDungForm

    list_display = ['id','first_name','last_name','username','birthdate','date_joined','phong']
    search_fields = ['id','first_name','last_name','username']
    list_filter = ['birthdate','date_joined']


    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ['id','first_name','last_name','username','birthdate','date_joined','sdt','email','last_login','is_staff','is_superuser','avatar_display']
        return []

    def get_exclude(self, request, obj=None):
        if obj:
            return ['password','avatar']
        return ['last_login','date_joined']

    def avatar_display(self, obj):
        if obj.avatar:  # Kiểm tra nếu trường avatar có dữ liệu
            return format_html('<img src="{}" style="height: 100px; width: auto;" />', obj.avatar.url)
        return "No Image"

    avatar_display.short_description = "Avatar"

    def save_model(self, request, obj, form, change):

        if obj.password and not change:
            obj.set_password(obj.password)
        super().save_model(request, obj, form, change)
    
class AdminPhiCacDichVu(admin.ModelAdmin):
    pass


admin_site = MyAdminSite(name='Quản Lý Chung Cư')

admin_site.register(Phong,AdminPhong)
admin_site.register(NguoiDung,AdminNguoiDung)
admin_site.register(PhiCacDichVu,AdminPhiCacDichVu)


