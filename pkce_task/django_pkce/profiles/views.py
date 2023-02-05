# views.py
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth import authenticate, login
import random, string


def get_authorization_code(request):
    # Generate a random string as the authorization code
    authorization_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=32))

    # print the Auth code in console
    print('=' * 50)
    print(f'authorization_code: {authorization_code}')
    print('=' * 50)

    # Return the authorization code as a response
    return JsonResponse({'authorization_code': authorization_code})

def get_access_token(request):

    # Fetch the Auth code
    authorization_code = request.GET.get('code')

    # Generate the Access token
    access_token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=32))

    # Print Access token in console
    print('=' * 50)
    print(f'access_token: {access_token}')
    print('=' * 50)

    # Return the access token
    return JsonResponse({'access_token': access_token})

def login_view(request):

    # Recive the access token
    access_token = request.GET.get('access_token')

    # authanticate the access token
    user = authenticate(access_token=access_token)

    if user is not None:
        login(request, user)
        return JsonResponse({'status': 'success'})
    else:
        return JsonResponse({'status': 'fail'})
