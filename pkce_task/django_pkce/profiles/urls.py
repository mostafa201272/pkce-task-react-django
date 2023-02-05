# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('get-authorization-code/', views.get_authorization_code, name='get_authorization_code'),
    path('get-access-token/', views.get_access_token, name='get_access_token'),
    path('login/', views.login_view, name='login'),
]
