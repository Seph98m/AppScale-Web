import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class AuthUser {
  final int userId;
  final String username;
  final String fullName;
  final String role;
  final String? barangay;
  final String? municipality;
  final String? profilePicture;

  const AuthUser({
    required this.userId,
    required this.username,
    required this.fullName,
    required this.role,
    this.barangay,
    this.municipality,
    this.profilePicture,
  });

  factory AuthUser.fromMap(Map<String, dynamic> map) {
    return AuthUser(
      userId: map['user_id'] is int ? map['user_id'] as int : int.tryParse('${map['user_id']}') ?? 0,
      username: (map['username'] ?? '').toString(),
      fullName: (map['full_name'] ?? '').toString(),
      role: (map['role'] ?? '').toString(),
      barangay: map['barangay'] == null ? null : map['barangay'].toString(),
      municipality: map['municipality'] == null ? null : map['municipality'].toString(),
      profilePicture: map['profile_picture'] == null ? null : map['profile_picture'].toString(),
    );
  }
}

class AuthSession {
  final String token;
  final AuthUser user;

  const AuthSession({
    required this.token,
    required this.user,
  });

  Map<String, dynamic> toMap() => {
        'token': token,
        'user': {
          'user_id': user.userId,
          'username': user.username,
          'full_name': user.fullName,
          'role': user.role,
          'barangay': user.barangay,
          'municipality': user.municipality,
          'profile_picture': user.profilePicture,
        },
      };

  factory AuthSession.fromMap(Map<String, dynamic> map) {
    return AuthSession(
      token: (map['token'] ?? '').toString(),
      user: AuthUser.fromMap(Map<String, dynamic>.from(map['user'] ?? {})),
    );
  }
}

class AuthApi {
  AuthApi._();

  static String get _baseUrl {
    const configured = String.fromEnvironment('API_BASE_URL');
    if (configured.isNotEmpty) return configured;
    return kIsWeb ? 'http://localhost:5000/api' : 'http://10.0.2.2:5000/api';
  }

  static AuthSession parseLoginResponse(Map<String, dynamic> payload) {
    final token = (payload['token'] ?? '').toString();
    final userMap = payload['user'];
    if (token.isEmpty || userMap == null) {
      throw const FormatException('Invalid login response from server.');
    }
    return AuthSession(
      token: token,
      user: AuthUser.fromMap(Map<String, dynamic>.from(userMap)),
    );
  }

  static Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email.trim(),
        'password': password,
      }),
    );

    final body = response.body.isEmpty ? {} : jsonDecode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = body is Map ? (body['message'] ?? 'Login failed.') : 'Login failed.';
      throw Exception(message);
    }

    if (body is! Map<String, dynamic>) {
      throw const FormatException('Unexpected login response format.');
    }

    return parseLoginResponse(body);
  }
}
