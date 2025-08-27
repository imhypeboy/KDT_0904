package com.example.dicomproject.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;
@Configuration
@EnableJpaRepositories(
        basePackages = "com.example.dicomproject.userrepo.repository",
        entityManagerFactoryRef = "mariaEmf",
        transactionManagerRef = "mariaTx"
)
public class MariaDbConfig {

    @Primary
    @Bean
    @ConfigurationProperties("spring.datasource.mariadb")
    public DataSourceProperties mariaProps() {  // url/username/password/driver 바인딩
        return new DataSourceProperties();
    }

    @Primary
    @Bean
    public DataSource mariaDataSource(@Qualifier("mariaProps") DataSourceProperties props) {
        // url이 자동으로 Hikari jdbcUrl에 매핑됨
        return props.initializeDataSourceBuilder()
                .type(com.zaxxer.hikari.HikariDataSource.class)
                .build();
    }

    @Primary
    @Bean(name = "mariaEmf")
    public LocalContainerEntityManagerFactoryBean mariaEmf(
            EntityManagerFactoryBuilder builder,
            @Qualifier("mariaDataSource") DataSource ds
    ) {
        return builder.dataSource(ds)
                .packages("com.example.dicomproject.userrepo.entity")
                .persistenceUnit("mariaPU")
                .build();
    }

    @Primary
    @Bean(name = "mariaTx")
    public PlatformTransactionManager mariaTx(
            @Qualifier("mariaEmf") EntityManagerFactory emf
    ) {
        return new JpaTransactionManager(emf);
    }
}
