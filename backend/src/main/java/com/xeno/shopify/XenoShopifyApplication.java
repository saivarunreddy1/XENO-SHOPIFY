package com.xeno.shopify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {"com.xeno.shopify", "com.xeno.assignment"})
@EntityScan(basePackages = {"com.xeno.shopify.model", "com.xeno.assignment.entity"})
@EnableJpaRepositories(basePackages = {"com.xeno.shopify.repository", "com.xeno.assignment.repository"})
@EnableScheduling
public class XenoShopifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(XenoShopifyApplication.class, args);
    }

}
