package com.example.globalipplatform.project.config;

import com.example.globalipplatform.project.DTO.Role;
import com.example.globalipplatform.project.entity.Patent;
import com.example.globalipplatform.project.entity.Trademark;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Random;

@Configuration
public class DataInitializer {

    @Value("${mock.data.patent.size:1000}")
    private int patentSize;

    @Value("${mock.data.trademark.size:500}")
    private int trademarkSize;

    @Value("${mock.data.generate.on.startup:true}")
    private boolean generateOnStartup;

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PatentRepository patentRepository,
            TrademarkRepository trademarkRepository,
            SubscriptionRepository subscriptionRepository,
            NotificationRepository notificationRepository,
            FilingsRepository filingsRepository,
            UserSearchRepository userSearchRepository) {
        return args -> {
            // Create test admin user if not exists
            User admin = userRepository.findByEmail("admin@test.com").orElse(new User());
            admin.setUsername("admin");
            admin.setEmail("admin@test.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("✅ Admin user ensured - username: admin, email: admin@test.com");

            // Create test analyst user if not exists
            User analyst = userRepository.findByEmail("analyst@test.com").orElse(new User());
            analyst.setUsername("analyst");
            analyst.setEmail("analyst@test.com");
            analyst.setPassword(passwordEncoder.encode("analyst123"));
            analyst.setRole(Role.ANALYST);
            userRepository.save(analyst);
            System.out.println("✅ Analyst user ensured - username: analyst, email: analyst@test.com");

            // Create test regular user if not exists
            if (!userRepository.existsByEmail("user@test.com")) {
                User user = new User();
                user.setUsername("user");
                user.setEmail("user@test.com");
                user.setPassword(passwordEncoder.encode("user123"));
                user.setRole(Role.USER);
                userRepository.save(user);
                System.out.println("✅ Regular user created - email: user@test.com, password: user123");
            }

            // Seed IP data
            if (generateOnStartup) {
                long patentCount = patentRepository.count();
                if (patentCount == 0) {
                    System.out.println("⚠️ Database empty. Seeding fresh Patents (" + patentSize + ")...");
                    System.out.println("⚠️ Data mismatch (Found " + patentCount + "). Wiping related data first...");
                    
                    // Safely clear all tables that depend on Patents/Trademarks
                    subscriptionRepository.deleteAll();
                    notificationRepository.deleteAll();
                    filingsRepository.deleteAll();
                    userSearchRepository.deleteAll();
                    
                    System.out.println("⚠️ Wiping and seeding fresh Patents (1000)...");
                    try {
                        patentRepository.deleteAll(); 
                        seedPatents(patentRepository);
                        System.out.println("✅ Final Patent Verification: " + patentRepository.count());
                    } catch (Exception e) {
                        System.err.println("❌ ERROR SEEDING PATENTS: " + e.getMessage());
                        e.printStackTrace();
                    }
                } else {
                    System.out.println("✅ Patents already exist (" + patentCount + ").");
                }

                long tmCount = trademarkRepository.count();
                if (tmCount == 0) {
                    System.out.println("⚠️ Database empty. Seeding fresh Trademarks (" + trademarkSize + ")...");
                    try {
                        trademarkRepository.deleteAll(); 
                        seedTrademarks(trademarkRepository);
                        System.out.println("✅ Final Trademark Verification: " + trademarkRepository.count());
                    } catch (Exception e) {
                        System.err.println("❌ ERROR SEEDING TRADEMARKS: " + e.getMessage());
                    }
                } else {
                    System.out.println("✅ Trademarks already exist (" + tmCount + ").");
                }
            }
        };
    }

    private void seedPatents(PatentRepository repo) {
        Random rand = new Random(42);
        String[] titles = {
            "AI-Based Medical Imaging System", "Autonomous Drone Navigation Method",
            "Blockchain-Based Digital Identity Verification", "Smart Grid Energy Optimization",
            "Natural Language Processing for Legal Documents", "Quantum Computing Error Correction",
            "5G Antenna Array Design", "Wearable Health Monitoring Device",
            "Machine Learning for Drug Discovery", "Augmented Reality Surgical Assistance",
            "Battery Storage Optimization System", "Next-Gen EV Battery Management",
            "Solid-State Battery Electrolyte", "Lithium-Ion Battery Safety Circuit"
        };
        String[] assignees = {"Google LLC", "Microsoft Corporation", "Apple Inc.", "IBM Corporation", "Samsung Electronics"};
        String[] jurisdictions = {"USPTO", "EPO", "WIPO", "JPO", "UKIPO"};
        String[] statuses = {"Granted", "Pending", "Published", "Expired"};
        String[] technologies = {"Artificial Intelligence", "Biotechnology", "Blockchain", "Clean Energy", "Cybersecurity", "IoT"};

        java.util.List<Patent> patentList = new java.util.ArrayList<>();
        for (int i = 0; i < patentSize; i++) {
            Patent p = new Patent();
            p.setTitle(titles[i % titles.length] + (i > titles.length ? " (" + i + ")" : ""));
            p.setAssetNumber("PAT-" + (100000 + i));
            p.setApplicationNumber("APP-202" + rand.nextInt(5) + "-" + (1000 + i));
            p.setAbstractText("This invention relates to " + p.getTitle().toLowerCase() + " and provides a novel approach in " + technologies[i % technologies.length]);
            p.setJurisdiction(jurisdictions[rand.nextInt(jurisdictions.length)]);
            p.setStatus(statuses[rand.nextInt(statuses.length)]);
            p.setTechnology(technologies[i % technologies.length]);
            p.setAssignee(assignees[rand.nextInt(assignees.length)]);
            p.setInventors("Dr. Scientist " + i);
            p.setFilingDate(LocalDateTime.now().minusMonths(rand.nextInt(60)));
            patentList.add(p);
        }
        repo.saveAll(patentList);
        System.out.println("✅ Seeded " + patentSize + " mock patents.");
    }

    private void seedTrademarks(TrademarkRepository repo) {
        Random rand = new Random(99);
        String[] marks = {"NovaTech", "AquaPure", "SkyVault", "CyberShield", "EcoWave", "DataForge"};
        String[] owners = {"NovaTech Inc.", "AquaPure Corp.", "SkyVault Technologies", "CyberShield Ltd."};
        String[] jurisdictions = {"USPTO", "EUIPO", "WIPO", "UKIPO"};
        String[] statuses = {"Registered", "Pending", "Opposition", "Expired"};

        java.util.List<Trademark> tmList = new java.util.ArrayList<>();
        for (int i = 0; i < trademarkSize; i++) {
            Trademark t = new Trademark();
            t.setMark(marks[i % marks.length]);
            t.setTitle(t.getMark() + " Trademark");
            t.setAssetNumber("TM-" + (200000 + i));
            t.setApplicationNumber("TMA-202" + rand.nextInt(5) + "-" + (2000 + i));
            t.setJurisdiction(jurisdictions[rand.nextInt(jurisdictions.length)]);
            t.setStatus(statuses[rand.nextInt(statuses.length)]);
            t.setAssignee(owners[rand.nextInt(owners.length)]);
            t.setFilingDate(LocalDateTime.now().minusMonths(rand.nextInt(48)));
            tmList.add(t);
        }
        repo.saveAll(tmList);
        System.out.println("✅ Seeded " + trademarkSize + " mock trademarks.");
    }
}