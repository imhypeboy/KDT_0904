package com.example.dicomproject.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableJpaRepositories(
        basePackages = "com.example.dicomproject.dicomrepo",
        entityManagerFactoryRef = "oracleEmf",
        transactionManagerRef = "oracleTx"
)
public class OracleDbConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.oracle")
    public DataSourceProperties oracleProps() {
        return new DataSourceProperties();
    }

    @Bean
    public DataSource oracleDataSource(@Qualifier("oracleProps") DataSourceProperties props) {
        return props.initializeDataSourceBuilder()
                .type(com.zaxxer.hikari.HikariDataSource.class)
                .build();
    }

    @Bean(name = "oracleEmf")
    public LocalContainerEntityManagerFactoryBean oracleEmf(
            EntityManagerFactoryBuilder builder,
            @Qualifier("oracleDataSource") DataSource ds
    ) {
        return builder.dataSource(ds)
                .packages("com.example.dicomproject.dicomrepo.entity")
                .persistenceUnit("oraclePU")
                .build();
    }

    @Bean(name = "oracleTx")
    public PlatformTransactionManager oracleTx(
            @Qualifier("oracleEmf") EntityManagerFactory emf
    ) {
        return new JpaTransactionManager(emf);
    }
}