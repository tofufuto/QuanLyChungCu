from datetime import datetime
from itertools import count
from venv import create

from PIL.ImageChops import screen
from django import forms
from django.contrib import admin
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import format_html
from django.utils import timezone
from urllib3 import request

from quanlychungcu.models import Phong, NguoiDung, PhieuDongTien, ChiTietPhieuDongTien, KhaoSat, ChiTietKhaoSat, \
    LuaChon, TuDoDienTu, PhanAnh, TheGiuXeNguoiThan, BaseModel, PhiCacDichVu, ThongTinChuyenTien


class MyAdminSite(admin.AdminSite):
    site_header = "Quản Lý Chung Cư"
    site_title = "Hệ Thống Quản Lý"
    index_title = "Trang quản trị hệ thống"

    def get_urls(self):
        return [path('quanlychungcu-stats/',self.stats)] + super().get_urls()

    def stats(self,request):
        # Tổng số phòng
        total_phong = Phong.objects.count()

        # Số phòng chưa gán cho user
        phong_trong = Phong.objects.filter(nguoi_dung__isnull=True).count()

        # Số phòng đã gán cho user
        phong_da_co_nguoi = Phong.objects.filter(nguoi_dung__isnull=False).count()

        current_year = datetime.now().year

        phieu_dong_tien= PhieuDongTien.objects.filter(status=PhieuDongTien.StatusChoices.APPROVED, created_date__year=current_year).all()

        dt_1 = 0
        dt_2 = 0
        dt_3 = 0
        dt_4 = 0
        dt_5 = 0
        dt_6 = 0
        dt_7 = 0
        dt_8 = 0
        dt_9 = 0
        dt_10 = 0
        dt_11 = 0
        dt_12 = 0

        for pdt in phieu_dong_tien:
            if pdt.created_date.month == 1 :
                dt_1 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])
            if pdt.created_date.month == 2 :
                dt_2 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])
            if pdt.created_date.month == 3 :
                dt_3 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])
            if pdt.created_date.month == 4 :
                dt_4 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])
            if pdt.created_date.month == 5 :
                dt_5 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])
            if pdt.created_date.month == 6 :
                dt_6 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])
            if pdt.created_date.month == 7 :
                dt_7 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])
            if pdt.created_date.month == 8 :
                dt_8 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])
            if pdt.created_date.month == 9 :
                dt_9 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])
            if pdt.created_date.month == 10 :
                dt_10 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])
            if pdt.created_date.month == 11 :
                dt_11 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])
            if pdt.created_date.month == 12 :
                dt_12 += sum([ct.phi_dong for ct in pdt.chitiet_phieudongtiens.all()])

        tong_dt = int( dt_1+dt_2+dt_3+dt_4+dt_5+dt_6+dt_7+dt_8+dt_9+dt_10+dt_11+dt_12)

        return TemplateResponse(request, 'admin/stats.html', {
            'total_phong': total_phong,
            'phong_trong': phong_trong,
            'phong_da_co_nguoi': phong_da_co_nguoi,
            'current_year': current_year,
            'dt_1' : dt_1,
            'dt_2' : dt_2,
            'dt_3' : dt_3,
            'dt_4' : dt_4,
            'dt_5' : dt_5,
            'dt_6' : dt_6,
            'dt_7' : dt_7,
            'dt_8' : dt_8,
            'dt_9' : dt_9,
            'dt_10' : dt_10,
            'dt_11': dt_11,
            'dt_12' : dt_12,
            'tong_dt' : tong_dt,
        })

    def get_app_list(self, request):
        # Add custom link to admin index page
        app_list = super().get_app_list(request)
        # Tạo danh mục (sections)
        categories = {
            'Thu Phí': [],
            'Quản Lý Phòng': [],
            'Tài Khoản': [],
            'Khác': [],
        }

        # Duyệt qua danh sách app của Django Admin
        for app in app_list:
            for model in app.get("models", []):
                model_name = model['object_name']

                # Phân loại model vào danh mục phù hợp
                if model_name in ['PhieuDongTien', 'ChiTietPhieuDongTien', 'ThongTinChuyenTien','PhiCacDichVu']:
                    categories['Thu Phí'].append(model)
                elif model_name in ['Phong']:
                    categories['Quản Lý Phòng'].append(model)
                elif model_name in ['NguoiDung']:
                    categories['Tài Khoản'].append(model)
                else:
                    categories['Khác'].append(model)

        # Xây dựng danh sách mới có nhóm danh mục
        new_app_list = []
        for category, models in categories.items():
            if models:
                new_app_list.append({
                    'name': category,  # Tên nhóm
                    'app_url': None,  # Không có URL, chỉ là nhóm
                    'models': models
                })
        new_app_list.append({
            'name': 'Thống kê',
            'app_url': '/admin/quanlychungcu-stats/',
            'models': []
        })
        return new_app_list


class AdminPhong(admin.ModelAdmin):
    list_display = ['id','so_phong','created_date']
    search_fields = ['so_phong']
    list_filter = ['created_date']
    readonly_fields = ['created_date','update_date']

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ['so_phong','created_date','update_date']
        return ['created_date','update_date']

class NguoiDungForm(forms.ModelForm):
    class Meta:
        model = NguoiDung
        fields = '__all__'
        widgets = {
            'password': forms.PasswordInput(render_value=True),  # Dùng PasswordInput
        }

def tao_phieu_dong_tien(modeladmin, request, queryset):
    cac_dich_vu = PhiCacDichVu.objects.all()
    for user in queryset:
        if user.is_staff or user.is_superuser:
            continue
        phieu_dong_tien = PhieuDongTien.objects.create(nguoi_dung=user,screenshot_xac_nhan = None)
        for dv in cac_dich_vu:
            chi_tiet_phieu = ChiTietPhieuDongTien.objects.create(phieu=phieu_dong_tien,ten_dich_vu=dv.ten_dich_vu,noi_dung=dv.noi_dung,phi_dong=dv.phi_dong)

    modeladmin.message_user(request, "Đã tạo phiếu")
    tao_phieu_dong_tien.short_description = "Tạo các phiếu đóng tiền cho người dùng được chọn(trừ admin)"

class AdminNguoiDung(admin.ModelAdmin):
    form = NguoiDungForm

    list_display = ['id','first_name','last_name','username','birthdate','date_joined','phong']
    search_fields = ['id','first_name','last_name','username']
    list_filter = ['birthdate','date_joined','is_superuser','is_staff','is_active']

    actions = [tao_phieu_dong_tien]

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ['id','first_name','last_name','username','birthdate','date_joined','sdt','email','last_login','is_staff','is_superuser','avatar_display','cccd']
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
    search_fields = ['ten_dich_vu']
    list_filter = ['created_date']
    readonly_fields = ['created_date','update_date']
    list_display = ['ten_dich_vu']

class AdminThongTinChuyenTien(admin.ModelAdmin):
    list_display = ['ten','so_tai_khoang','ngan_hang']
    readonly_fields = ['created_date','update_date']


class ChiTietPhieuDongTienInline(admin.TabularInline):
    model = ChiTietPhieuDongTien
    fields = ['ten_dich_vu', 'noi_dung', 'formatted_phi_dong']  # Sử dụng phương thức tùy chỉnh
    readonly_fields = ['ten_dich_vu', 'noi_dung', 'formatted_phi_dong']  # Trường chỉ đọc
    extra = 0  # Không hiển thị form thêm mới
    max_num = 0
    can_delete = False  # Tắt khả năng xóa

    def formatted_phi_dong(self, obj):
        """Hiển thị phi_dong dưới dạng số nguyên và thêm 'VND'. Nếu None thì hiển thị '0 VND'."""
        if obj.phi_dong is not None:
            return f"{int(obj.phi_dong):,} VND"  # Định dạng có dấu phẩy
        return "0 VND"  # Trường hợp phi_dong bị None

    formatted_phi_dong.short_description = "Phí Đóng (VND)"

class MonthYearFilter(admin.SimpleListFilter):
    title = 'Tháng và Năm'  # Tiêu đề của bộ lọc
    parameter_name = 'month_year'  # Tên tham số URL

    def lookups(self, request, model_admin):
        # Trả về danh sách các lựa chọn tháng và năm
        current_year = timezone.now().year
        lookups = []
        for i in range(1, 13):  # 12 tháng
            month_name = timezone.datetime(current_year, i, 1).strftime('%B')  # Tên tháng
            lookups.append((f'{current_year}-{i:02d}', f'{month_name} {current_year}'))
        return lookups

    def queryset(self, request, queryset):
        # Xử lý dữ liệu khi người dùng chọn tháng và năm từ bộ lọc
        if self.value():
            year_month = self.value().split('-')
            year = int(year_month[0])
            month = int(year_month[1])
            return queryset.filter(created_date__year=year, created_date__month=month)
        return queryset


class PhieuDongTienAdmin(admin.ModelAdmin):
    list_display = ['id','nguoi_dung', 'status','created_date','tong_tien']
    inlines = [ChiTietPhieuDongTienInline]  # Thêm Inline vào trang admin của PhieuDongTien
    readonly_fields = ['id','nguoi_dung', 'screenshot_xac_nhan_display','created_date','update_date','tong_tien']
    list_filter = ['status',MonthYearFilter]
    search_fields = ['nguoi_dung__username']
    exclude = ['screenshot_xac_nhan']

    def tong_tien(self, obj):
        """Tính tổng tiền từ các chi tiết phiếu."""
        total = sum(ct.phi_dong for ct in obj.chitiet_phieudongtiens.all() if ct.phi_dong is not None)
        return f"{int(total):,} VND"  # Định dạng số có dấu phẩy

    tong_tien.short_description = "Tổng tiền"

    # Ghi đè get_model_perms để tắt quyền 'add' và 'delete' cho model chính
    def get_model_perms(self, request):
        perms = super().get_model_perms(request)
        perms['add'] = False  # Tắt quyền tạo mới
        perms['delete'] = False  # Tắt quyền xóa
        return perms

    # Ghi đè has_add_permission để tắt quyền thêm mới
    def has_add_permission(self, request):
        return False  # Trả về False để tắt nút "Add"

    # Ghi đè has_delete_permission để tắt quyền xóa
    def has_delete_permission(self, request, obj=None):
        return False  # Trả về False để tắt quyền xóa

    def screenshot_xac_nhan_display(self, obj):
        if obj.screenshot_xac_nhan:  # Kiểm tra nếu trường avatar có dữ liệu
            return format_html('<img src="{}" style="height: 800px; width: 450px;" />', obj.screenshot_xac_nhan.url)
        return "No Image"


class TheGiuXeAdmin(admin.ModelAdmin):
    list_display = ['so_xe','nguoi_dung','ten_nguoi_than']
    readonly_fields = ['so_xe','nguoi_dung','ten_nguoi_than','created_date','update_date']



admin_site = MyAdminSite(name='Quản Lý Chung Cư')

admin_site.register(Phong,AdminPhong)
admin_site.register(PhieuDongTien, PhieuDongTienAdmin)
admin_site.register(NguoiDung,AdminNguoiDung)
admin_site.register(PhiCacDichVu,AdminPhiCacDichVu)
admin_site.register(ThongTinChuyenTien,AdminThongTinChuyenTien)
admin_site.register(TheGiuXeNguoiThan,TheGiuXeAdmin)





