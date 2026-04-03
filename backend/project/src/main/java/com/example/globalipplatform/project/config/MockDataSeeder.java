package com.example.globalipplatform.project.config;

import com.example.globalipplatform.project.entity.Patent;
import com.example.globalipplatform.project.entity.Trademark;
import com.example.globalipplatform.project.repository.PatentRepository;
import com.example.globalipplatform.project.repository.TrademarkRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.time.LocalDateTime;
import java.util.Random;

@Configuration
public class MockDataSeeder {

    @Value("${mock.data.patent.size:100}")
    private int patentSize;

    @Value("${mock.data.trademark.size:50}")
    private int trademarkSize;

    @Value("${mock.data.generate.on.startup:true}")
    private boolean generateOnStartup;

    @Bean
    @Order(2)
    public CommandLineRunner seedIPData(PatentRepository patentRepository, TrademarkRepository trademarkRepository) {
        return args -> {
            if (!generateOnStartup) {
                System.out.println("⏭️ Mock data generation disabled.");
                return;
            }

            if (patentRepository.count() > 0) {
                System.out.println("✅ Patents already exist (" + patentRepository.count() + "), skipping seeding.");
            } else {
                seedPatents(patentRepository);
            }

            if (trademarkRepository.count() > 0) {
                System.out.println("✅ Trademarks already exist (" + trademarkRepository.count() + "), skipping seeding.");
            } else {
                seedTrademarks(trademarkRepository);
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
            "IoT-Based Smart Agriculture System", "Neural Network Chip Architecture",
            "Crypto Wallet Security Protocol", "Robotic Prosthetic Limb Control",
            "Genetic Data Compression Algorithm", "Solid-State Battery Technology",
            "Cloud-Native Database Replication", "Autonomous Vehicle Path Planning",
            "Edge Computing Data Aggregation", "Computer Vision Defect Detection",
            "Renewable Energy Storage System", "Advanced Water Purification Method",
            "Smart Contract Execution Platform", "3D Bioprinting Tissue Scaffold",
            "Satellite Communication Protocol", "Federated Learning Framework",
            "Voice-Activated Home Automation", "Carbon Capture and Storage Process",
            "Digital Twin Simulation Engine", "Predictive Maintenance Algorithm"
        };

        String[] assignees = {
            "Google LLC", "Microsoft Corporation", "Apple Inc.", "Amazon Technologies",
            "IBM Corporation", "Samsung Electronics", "Intel Corporation", "Qualcomm Inc.",
            "Meta Platforms", "Tesla Inc.", "NVIDIA Corporation", "Cisco Systems",
            "Oracle Corporation", "Adobe Inc.", "Siemens AG", "Huawei Technologies",
            "Sony Group Corporation", "Panasonic Holdings", "LG Electronics", "Bosch GmbH"
        };

        String[] jurisdictions = {"USPTO", "EPO", "WIPO", "JPO", "KIPO", "CNIPA", "UKIPO", "INPI"};
        String[] statuses = {"Granted", "Pending", "Published", "Under Examination", "Expired"};
        String[] technologies = {
            "Artificial Intelligence", "Biotechnology", "Blockchain", "Clean Energy",
            "Cloud Computing", "Cybersecurity", "IoT", "Quantum Computing",
            "Robotics", "Semiconductors", "Telecommunications", "Nanotechnology"
        };

        String[] inventors = {
            "Dr. Sarah Chen, Dr. James Liu", "Prof. Michael Brown, Dr. Emily Zhang",
            "Dr. Akira Tanaka, Dr. Priya Sharma", "Dr. Carlos Mendez, Dr. Anna Kowalski",
            "Dr. David Kim, Dr. Maria Garcia", "Dr. John Smith, Dr. Li Wei",
            "Dr. Rachel Green, Dr. Omar Ali", "Prof. Hans Mueller, Dr. Yuki Sato"
        };

        int size = Math.min(patentSize, 200);
        for (int i = 0; i < size; i++) {
            Patent p = new Patent();
            String title = titles[i % titles.length];
            if (i >= titles.length) {
                title = title + " (v" + (i / titles.length + 1) + ")";
            }
            p.setTitle(title);
            p.setAssetNumber("PAT-" + String.format("%06d", 100000 + i));
            p.setApplicationNumber("APP-" + (2018 + rand.nextInt(8)) + "-" + String.format("%04d", rand.nextInt(9999)));
            p.setAbstractText("This invention relates to " + title.toLowerCase()
                + ". It provides a novel approach to solving key challenges in the field of "
                + technologies[i % technologies.length].toLowerCase()
                + " with improved efficiency and scalability.");
            p.setJurisdiction(jurisdictions[rand.nextInt(jurisdictions.length)]);
            p.setStatus(statuses[rand.nextInt(statuses.length)]);
            p.setTechnology(technologies[i % technologies.length]);
            p.setAssignee(assignees[rand.nextInt(assignees.length)]);
            p.setAssigneeCountry(new String[]{"US", "DE", "JP", "KR", "CN", "GB", "FR", "IN"}[rand.nextInt(8)]);
            p.setInventors(inventors[rand.nextInt(inventors.length)]);
            p.setIpcClasses("G06F " + (rand.nextInt(50) + 1) + "/" + String.format("%02d", rand.nextInt(100)));
            p.setCpcClasses("H04L " + (rand.nextInt(70) + 1) + "/" + String.format("%04d", rand.nextInt(10000)));
            p.setFilingDate(LocalDateTime.of(2018 + rand.nextInt(8), 1 + rand.nextInt(12), 1 + rand.nextInt(27), 0, 0));
            p.setPublicationDate(p.getFilingDate().plusMonths(6 + rand.nextInt(12)));
            if ("Granted".equals(p.getStatus())) {
                p.setGrantDate(p.getPublicationDate().plusMonths(6 + rand.nextInt(18)));
            }
            p.setLegalStatus(p.getStatus().equals("Granted") ? "Active" : "Pending");
            p.setCitationCount(rand.nextInt(50));
            p.setClaimCount(5 + rand.nextInt(40));
            p.setDrawingCount(1 + rand.nextInt(15));
            p.setPatentType(new String[]{"Utility", "Design", "Plant"}[rand.nextInt(3)]);
            p.setAnnualFeePaid(rand.nextBoolean());
            p.setFamilyId("FAM-" + String.format("%04d", rand.nextInt(500)));
            p.setIsCorePatent(rand.nextInt(5) == 0); // 20% chance
            repo.save(p);
        }

        System.out.println("✅ Seeded " + size + " mock patents.");
    }

    private void seedTrademarks(TrademarkRepository repo) {
        Random rand = new Random(99);

        String[] marks = {
            "NovaTech", "AquaPure", "SkyVault", "CyberShield", "EcoWave",
            "DataForge", "QuantumLeap", "BioSynth", "SolarEdge", "NanoCore",
            "CloudHive", "MedXpert", "GreenPulse", "DigiVault", "SmartFusion",
            "NeuraLink Pro", "AeroSwift", "TerraFlow", "CryptoGuard", "OmniView",
            "FlexiGrid", "VitaBlend", "LogiTrack", "PureSignal", "InnoSphere"
        };

        String[] owners = {
            "NovaTech Inc.", "AquaPure Corp.", "SkyVault Technologies", "CyberShield Ltd.",
            "EcoWave Holdings", "DataForge Solutions", "QuantumLeap Systems", "BioSynth Pharma",
            "SolarEdge Technologies", "NanoCore Materials", "CloudHive Inc.", "MedXpert Health",
            "GreenPulse Energy", "DigiVault Security", "SmartFusion Labs"
        };

        String[] jurisdictions = {"USPTO", "EUIPO", "WIPO", "UKIPO", "CIPO", "IP Australia"};
        String[] statuses = {"Registered", "Pending", "Opposition", "Published", "Expired"};
        String[] markTypes = {"WORD", "FIGURATIVE", "WORD_FIGURATIVE", "3D"};
        String[] niceClasses = {"9", "35", "42", "9,42", "35,42", "9,35,42", "38", "16", "25"};
        String[] goodsServices = {
            "Computer software; mobile applications; electronic data processing",
            "Business management consulting; advertising services; retail store services",
            "Scientific and technological services; software as a service (SaaS)",
            "Telecommunications services; electronic mail; internet service provider",
            "Medical apparatus; surgical instruments; health monitoring devices",
            "Financial services; electronic payment processing; cryptocurrency exchange"
        };

        int size = Math.min(trademarkSize, 100);
        for (int i = 0; i < size; i++) {
            Trademark t = new Trademark();
            String mark = marks[i % marks.length];
            if (i >= marks.length) {
                mark = mark + " " + (i / marks.length + 1);
            }
            t.setMark(mark);
            t.setTitle(mark + " Trademark");
            t.setAssetNumber("TM-" + String.format("%06d", 200000 + i));
            t.setApplicationNumber("TMA-" + (2018 + rand.nextInt(8)) + "-" + String.format("%04d", rand.nextInt(9999)));
            t.setRegistrationNumber("REG-" + String.format("%07d", 3000000 + i));
            t.setJurisdiction(jurisdictions[rand.nextInt(jurisdictions.length)]);
            t.setStatus(statuses[rand.nextInt(statuses.length)]);
            t.setAssignee(owners[rand.nextInt(owners.length)]);
            t.setAssigneeCountry(new String[]{"US", "DE", "JP", "AU", "CA", "GB"}[rand.nextInt(6)]);
            t.setMarkType(markTypes[rand.nextInt(markTypes.length)]);
            t.setNiceClasses(niceClasses[rand.nextInt(niceClasses.length)]);
            t.setGoodsServices(goodsServices[rand.nextInt(goodsServices.length)]);
            t.setFilingDate(LocalDateTime.of(2018 + rand.nextInt(8), 1 + rand.nextInt(12), 1 + rand.nextInt(27), 0, 0));
            if ("Registered".equals(t.getStatus())) {
                t.setRenewalDate(t.getFilingDate().plusYears(10).toString().substring(0, 10));
            }
            t.setIsLogo("FIGURATIVE".equals(t.getMarkType()) || "WORD_FIGURATIVE".equals(t.getMarkType()));
            t.setColorClaim(t.getIsLogo() ? "Blue, White, Silver" : null);
            t.setIsCoreTrademark(rand.nextInt(4) == 0); // 25% chance
            t.setFamilyId("TMFAM-" + String.format("%04d", rand.nextInt(300)));
            t.setTechnology(new String[]{"Software", "Hardware", "Pharma", "Energy", "Finance"}[rand.nextInt(5)]);
            t.setCitationCount(rand.nextInt(20));
            repo.save(t);
        }

        System.out.println("✅ Seeded " + size + " mock trademarks.");
    }
}
