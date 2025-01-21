from enum import Enum
from typing import final


class PhieuStatus(Enum):
    WAITING = 'WAITING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'

class PhanAnhStatus(Enum):
    WAITING = 'WAITING'
    VIEWED = 'VIEWED'

VNP_TMNCODE = 'BGJVFP3Z'
VNP_HASHSECRET = '9JVDXL67YUMV3I01HKS36KAPKQCL7TN5'
VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
VNP_RETURN_URL = 'https://quanlychungcuhuydung.loca.lt/vnpay_return'
