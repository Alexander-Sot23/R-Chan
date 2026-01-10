package com.alexander.spring.r_chan.r_chan.webtoken;

import com.alexander.spring.r_chan.r_chan.entity.AdminUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
public class JWTService {

    @Value("${jwt.secret}")
    private String SECRET;

    @Value("${jwt.expiration}")
    private int expiration;

    public String generateToken(AdminUser adminUser) {
        return generateToken(adminUser.getUsername());
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails.getUsername());
    }

    private String generateToken(String username) {
        long VALIDITY = TimeUnit.HOURS.toMillis(expiration);
        return Jwts.builder()
                .subject(username)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusMillis(VALIDITY)))
                .signWith(generateKey())
                .compact();
    }

    private SecretKey generateKey() {
        byte[] decodedKey = Base64.getDecoder().decode(SECRET);
        return Keys.hmacShaKeyFor(decodedKey);
    }

    private Claims getClaims(String jwt) {
        return Jwts.parser()
                .verifyWith(generateKey())
                .build()
                .parseSignedClaims(jwt)
                .getPayload();
    }

    public String extractUserName(String jwt) {
        Claims claims = getClaims(jwt);
        return claims.getSubject();
    }

    public boolean isTokenValid(String jwt) {
        Claims claims = getClaims(jwt);
        return claims.getExpiration().after(Date.from((Instant.now())));
    }
}