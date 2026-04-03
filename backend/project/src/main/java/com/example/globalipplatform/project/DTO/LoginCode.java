package com.example.globalipplatform.project.DTO;

import lombok.Getter;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;


@Getter
public class LoginCode  {



        private final String code;
        private final LocalDateTime expiry;

        public LoginCode(String code, LocalDateTime expiry) {
            this.code = code;
            this.expiry = expiry;
        }

}
