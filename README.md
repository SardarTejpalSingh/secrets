# secrets

Created simple user registration RESTful api

1. For user registration.

POST Request with firstname, lastname, email and passowrd =>
http://localhost:3000/users/register

2. User login 
POST Request with email and password => 
http://localhost:3000/users/login

3. User update.

Authorization with JWT token. User can update firstname and lastname only.
PATCH Request
http://localhost:3000/users/update

4. User Delete

Authorization with JWT token.
DELETE Request
http://localhost:3000/users/delete
