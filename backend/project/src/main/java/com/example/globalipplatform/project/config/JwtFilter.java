package com.example.globalipplatform.project.config;

import com.example.globalipplatform.project.DTO.Role;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JWTService jwtService;
    private final MyUserDetailsService userDetailsService;

    // List of public paths that don't need JWT validation
    private final List<String> publicPaths = Arrays.asList(
            "/api/auth/login",
            "/api/auth/register",
            "/api/analyst-registration/",
            "/oauth2/",
            "/public/",
            "/api/test/public");

    public JwtFilter(JWTService jwtService, MyUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getServletPath();

        // Handle preflight OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            filterChain.doFilter(request, response);
            return;
        }

        // Check if this is a public path that doesn't need authentication
        for (String publicPath : publicPaths) {
            if (requestPath.startsWith(publicPath)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Handle file access with token in URL parameter
        if (requestPath.startsWith("/uploads/") || requestPath.startsWith("/api/files/")) {
            String token = request.getParameter("token");
            if (token != null && !token.isEmpty()) {
                try {
                    String email = jwtService.extractUsername(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    if (jwtService.validateToken(token, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                } catch (Exception e) {
                    logger.error("Error validating token from URL: " + e.getMessage());
                }
            }
            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT token from Authorization header
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Instead of letting it pass, set unauthorized for protected endpoints
            if (requestPath.startsWith("/api/ip/") || requestPath.startsWith("/api/admin/") ||
                    requestPath.startsWith("/api/analyst/") || requestPath.startsWith("/Users/") ||
                    requestPath.startsWith("/Admin/")) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter()
                        .write("{\"error\":\"Authentication required. Please provide a valid JWT token.\"}");
                return;
            }

            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email = null;

        try {
            email = jwtService.extractUsername(token);
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Token expired. Please login again.\"}");
            return;
        } catch (MalformedJwtException | SignatureException e) {
            logger.error("Invalid JWT token: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Invalid token format.\"}");
            return;
        } catch (Exception e) {
            logger.error("Error processing JWT token: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Authentication failed.\"}");
            return;
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Try to load user from database
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtService.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Token validation failed.\"}");
                    return;
                }
            } catch (UsernameNotFoundException ex) {
                // Try OAuth2 user
                try {
                    String role = jwtService.extractRole(token);
                    // Standard roles in token usually start with ROLE_ (e.g. ROLE_USER)
                    // but Enum.valueOf(Role.class, role) expects just 'USER'
                    if (role != null && role.startsWith("ROLE_")) {
                        role = role.substring(5);
                    }
                    UserPrincipal userPrincipal = new UserPrincipal(email, Role.valueOf(role));

                    if (jwtService.validateToken(token, userPrincipal)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userPrincipal,
                                null,
                                userPrincipal.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                } catch (Exception e) {
                    logger.error("Failed to authenticate OAuth2 user: " + e.getMessage());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"User not found.\"}");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}