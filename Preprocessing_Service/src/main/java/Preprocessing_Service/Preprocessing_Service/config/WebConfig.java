<<<<<<< HEAD
package Preprocessing_Service.Preprocessing_Service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        
        registry.addResourceHandler("/export/**")
                .addResourceLocations("file:export/");

        
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
=======
package Preprocessing_Service.Preprocessing_Service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        
        registry.addResourceHandler("/export/**")
                .addResourceLocations("file:export/");

        
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
>>>>>>> f2ca84ca05045926dc254d3581d23412f59c8cb4
