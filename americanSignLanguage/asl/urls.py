from django.urls import path
from django.views import View
from . import views

urlpatterns = [
    path('',views.home,name="home"),
    path('imageData',views.imageData,name="imageData"),
    path('sayWord',views.sayWord,name="sayWord"),
    path('contactus/', views.contactus_view, name='contactus')
]