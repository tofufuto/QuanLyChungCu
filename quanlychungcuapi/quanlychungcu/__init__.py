from enum import Enum


class PhieuStatus(Enum):
    WAITING = 'WAITING'
    PAID = 'PAID'

class PhanAnhStatus(Enum):
    WAITING = 'WAITING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'