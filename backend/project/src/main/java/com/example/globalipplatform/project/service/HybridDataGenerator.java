package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.entity.Patent;
import com.example.globalipplatform.project.entity.Trademark;
import com.example.globalipplatform.project.repository.PatentRepository;
import com.example.globalipplatform.project.repository.TrademarkRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class HybridDataGenerator {

    @Value("${mock.data.patent.size:1000}")
    private int targetPatentSize;
    
    @Value("${mock.data.trademark.size:500}")
    private int targetTrademarkSize;
    
    @Autowired
    private PatentRepository patentRepository;
    
    @Autowired
    private TrademarkRepository trademarkRepository;
    
    private final Random random = new Random();
    
    private final List<String> jurisdictions = Arrays.asList(
        "USPTO", "EPO", "WIPO", "JPO", "KIPO", "CIPO", "UKIPO", "DPMA"
    );
    
    private final List<String> statuses = Arrays.asList(
        "PENDING", "GRANTED", "EXPIRED", "ABANDONED"
    );
    
    private final List<String> technologies = Arrays.asList(
        "AI", "Biotech", "Electronics", "Energy", "Telecom", "Medical", "Automotive", "Software"
    );
    
    private final List<String> companies = Arrays.asList(
        "MedTech Corp", "Tesla Motors", "Moderna Therapeutics", "Huawei Technologies",
        "Sony Corporation", "Samsung Electronics", "BMW AG", "DJI Innovations",
        "Pfizer", "IBM", "Novartis", "SpaceX", "Oxford PV", "Intel Corporation",
        "Microsoft", "Google", "Apple", "Amazon", "Meta", "Netflix"
    );
    
    private final List<String> firstNames = Arrays.asList(
        "John", "Sarah", "Michael", "Emma", "David", "Maria", "Ahmed", "Wei",
        "James", "Linda", "Robert", "Patricia", "Thomas", "Jennifer", "Charles",
        "Elizabeth", "William", "Susan", "Joseph", "Margaret", "Richard", "Dorothy"
    );
    
    private final List<String> lastNames = Arrays.asList(
        "Smith", "Johnson", "Chen", "Patel", "Kim", "Singh", "Garcia", "Wong",
        "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson",
        "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Young"
    );
    
    @PostConstruct
    @Transactional
    public void initializeData() {
        try {
            System.out.println("=== Initializing Mock Data ===");
            
            // Check if data already exists
            long existingPatents = patentRepository.count();
            long existingTrademarks = trademarkRepository.count();
            
            if (existingPatents >= targetPatentSize && existingTrademarks >= targetTrademarkSize) {
                System.out.println("✅ Data already exists. Skipping generation.");
                System.out.println("   Patents: " + existingPatents + "/" + targetPatentSize);
                System.out.println("   Trademarks: " + existingTrademarks + "/" + targetTrademarkSize);
                return;
            }
            
            // Generate patents
            generatePatents();
            
            // Generate trademarks
            generateTrademarks();
            
            System.out.println("✅ Mock data generation complete!");
            System.out.println("   Total Patents: " + patentRepository.count());
            System.out.println("   Total Trademarks: " + trademarkRepository.count());
            
        } catch (Exception e) {
            System.err.println("❌ Error initializing data: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @Transactional
    public void generatePatents() {
        long currentCount = patentRepository.count();
        int needed = targetPatentSize - (int) currentCount;
        
        if (needed <= 0) {
            return;
        }
        
        System.out.println("Generating " + needed + " patents...");
        List<Patent> patents = new ArrayList<>();
        
        for (int i = 0; i < needed; i++) {
            Patent patent = createPatent();
            patents.add(patent);
            
            // Save in batches
            if (patents.size() >= 100) {
                patentRepository.saveAll(patents);
                patents.clear();
                System.out.print(".");
            }
        }
        
        if (!patents.isEmpty()) {
            patentRepository.saveAll(patents);
        }
        
        System.out.println("\n✅ Generated " + needed + " patents");
    }
    
    private Patent createPatent() {
    Patent patent = new Patent();
    
    // Basic info
    String jurisdiction = jurisdictions.get(random.nextInt(jurisdictions.size()));
    String company = companies.get(random.nextInt(companies.size()));
    String technology = technologies.get(random.nextInt(technologies.size()));
    
    patent.setAssetNumber(generatePatentNumber(jurisdiction));
    patent.setTitle(generateTitle(technology, company));
    patent.setJurisdiction(jurisdiction);
    patent.setAssignee(company);
    patent.setAssigneeCountry(getCountryFromJurisdiction(jurisdiction));
    patent.setTechnology(technology);
    
    // Inventors (1-4)
    int inventorCount = random.nextInt(4) + 1;
    List<String> inventorList = new ArrayList<>();
    for (int j = 0; j < inventorCount; j++) {
        inventorList.add(generateInventorName());
    }
    patent.setInventors(String.join(", ", inventorList));
    
    // Dates
    LocalDateTime filingDate = generateRandomDate(2018, 2025);
    patent.setFilingDate(filingDate);
    
    // Status based on filing date
    String status = determineStatus(filingDate);
    patent.setStatus(status);
    
    if (status.equals("GRANTED") || random.nextDouble() < 0.3) {
        patent.setPublicationDate(filingDate.plusMonths(18));
    }
    
    if (status.equals("GRANTED")) {
        patent.setGrantDate(filingDate.plusYears(2).plusMonths(random.nextInt(24)));
        patent.setGrantNumber("GR-" + System.nanoTime() + "-" + random.nextInt(10000));
    }
    
    // Description
    patent.setAbstractText(generateAbstract(technology, patent.getTitle()));
    patent.setDescription(patent.getAbstractText().substring(0, Math.min(100, patent.getAbstractText().length())));
    
    // Claims
    patent.setClaims(generateClaims());
    patent.setClaimCount(random.nextInt(20) + 5);
    
    // Classifications
    patent.setIpcClasses(generateIPCClasses(technology));
    patent.setCpcClasses(generateCPCClasses(technology));
    
    // Citations
    patent.setCitationCount(random.nextInt(100));
    
    // Legal status
    patent.setLegalStatus(status.equals("GRANTED") ? "Active - Granted" : "Pending Examination");
    patent.setAnnualFeePaid(status.equals("GRANTED") && random.nextDouble() < 0.8);
    
    if (patent.getAnnualFeePaid() != null && patent.getAnnualFeePaid()) {
        patent.setNextFeeDate(LocalDateTime.now().plusMonths(random.nextInt(12) + 1));
    }
    
    patent.setDrawingCount(random.nextInt(15) + 1);
    patent.setPatentType(random.nextDouble() < 0.9 ? "UTILITY" : "DESIGN");
    patent.setApplicationNumber("APP-" + System.nanoTime() + "-" + random.nextInt(1000000));
    patent.setPublicationNumber("PUB-" + System.nanoTime());
    patent.setExaminer(generateInventorName() + ", Examiner");
    patent.setCitedPatents("US-1234567, EP-2345678, WO-3456789");
    patent.setIsCorePatent(random.nextDouble() < 0.05); // 5% are core patents
    
    return patent;
}
    
    private String generatePatentNumber(String jurisdiction) {
        String prefix;
        switch (jurisdiction) {
            case "USPTO": prefix = "US"; break;
            case "EPO": prefix = "EP"; break;
            case "WIPO": prefix = "WO"; break;
            case "JPO": prefix = "JP"; break;
            case "KIPO": prefix = "KR"; break;
            default: prefix = jurisdiction.substring(0, 2);
        }
        
        long number = 10000000 + random.nextInt(90000000);
        String suffix = random.nextDouble() < 0.7 ? "B2" : (random.nextDouble() < 0.5 ? "A1" : "A");
        
        return prefix + "-" + number + "-" + suffix;
    }
    
    private String generateTitle(String technology, String company) {
        String[] actions = {"Method", "System", "Apparatus", "Device", "Process", "Composition"};
        String[] adjectives = {"Advanced", "Novel", "Improved", "Enhanced", "Integrated", "Automated"};
        String[] subjects = {
            "Data Processing", "Signal Analysis", "Image Recognition", "Wireless Communication",
            "Energy Storage", "Drug Delivery", "Genetic Modification", "Quantum Computing",
            "Neural Network", "Battery Management", "Sensor Array", "Robotic Control"
        };
        
        String action = actions[random.nextInt(actions.length)];
        String adjective = adjectives[random.nextInt(adjectives.length)];
        String subject = subjects[random.nextInt(subjects.length)];
        
        return adjective + " " + action + " for " + subject + " in " + technology;
    }
    
    private String generateInventorName() {
        return firstNames.get(random.nextInt(firstNames.size())) + " " + 
               lastNames.get(random.nextInt(lastNames.size()));
    }
    
    private LocalDateTime generateRandomDate(int startYear, int endYear) {
        long minDay = LocalDateTime.of(startYear, 1, 1, 0, 0).toEpochSecond(ZoneId.systemDefault().getRules().getOffset(LocalDateTime.now()));
        long maxDay = LocalDateTime.of(endYear, 12, 31, 23, 59).toEpochSecond(ZoneId.systemDefault().getRules().getOffset(LocalDateTime.now()));
        long randomDay = ThreadLocalRandom.current().nextLong(minDay, maxDay);
        return LocalDateTime.ofEpochSecond(randomDay, 0, ZoneId.systemDefault().getRules().getOffset(LocalDateTime.now()));
    }
    
    private String determineStatus(LocalDateTime filingDate) {
        long monthsOld = java.time.Duration.between(filingDate, LocalDateTime.now()).toDays() / 30;
        
        if (monthsOld < 18) {
            return random.nextDouble() < 0.8 ? "PENDING" : "GRANTED";
        } else if (monthsOld < 48) {
            return random.nextDouble() < 0.6 ? "GRANTED" : 
                   (random.nextDouble() < 0.7 ? "PENDING" : "ABANDONED");
        } else {
            return random.nextDouble() < 0.4 ? "GRANTED" : 
                   (random.nextDouble() < 0.5 ? "EXPIRED" : "ABANDONED");
        }
    }
    
    private String getCountryFromJurisdiction(String jurisdiction) {
        switch (jurisdiction) {
            case "USPTO": return "US";
            case "EPO": return "EP";
            case "WIPO": return "WO";
            case "JPO": return "JP";
            case "KIPO": return "KR";
            case "CIPO": return "CN";
            case "UKIPO": return "GB";
            case "DPMA": return "DE";
            default: return "US";
        }
    }
    
    private String generateAbstract(String technology, String title) {
        String[] templates = {
            "The present invention provides a novel " + title.toLowerCase() + ". ",
            "This invention relates to " + technology + " technology, specifically to " + title.toLowerCase() + ". ",
            "A system and method for " + title.toLowerCase() + " is disclosed. "
        };
        
        String template = templates[random.nextInt(templates.length)];
        
        String[] details = {
            "The system comprises a processor, memory, and specialized algorithms. ",
            "The method includes steps of data acquisition, processing, and analysis. ",
            "Embodiments include various implementations across different platforms. "
        };
        
        String[] benefits = {
            "This innovation significantly improves performance and efficiency.",
            "The disclosed approach reduces costs and increases reliability.",
            "Experimental results show a 30% improvement over existing methods."
        };
        
        return template + details[random.nextInt(details.length)] + 
               benefits[random.nextInt(benefits.length)];
    }
    
    private String generateClaims() {
        int numClaims = random.nextInt(15) + 5;
        StringBuilder claims = new StringBuilder();
        
        claims.append("1. A system comprising:\n");
        claims.append("   a) a processor configured to execute instructions;\n");
        claims.append("   b) a memory storing said instructions;\n");
        claims.append("   c) an input/output interface for data communication;\n\n");
        
        for (int i = 2; i <= numClaims; i++) {
            claims.append(i).append(". The system of claim 1, further comprising...\n");
        }
        
        return claims.toString();
    }
    
    private String generateIPCClasses(String technology) {
        Map<String, List<String>> ipcMap = new HashMap<>();
        ipcMap.put("AI", Arrays.asList("G06N", "G06F", "G06K"));
        ipcMap.put("Biotech", Arrays.asList("C12N", "A61K", "C07K"));
        ipcMap.put("Electronics", Arrays.asList("H01L", "G02F", "H05K"));
        ipcMap.put("Energy", Arrays.asList("H01M", "H02J", "F03D"));
        ipcMap.put("Telecom", Arrays.asList("H04W", "H04L", "H04B"));
        ipcMap.put("Medical", Arrays.asList("A61B", "G16H", "A61M"));
        ipcMap.put("Automotive", Arrays.asList("B60W", "F02D", "B60L"));
        ipcMap.put("Software", Arrays.asList("G06F", "G06Q", "G06N"));
        
        List<String> classes = ipcMap.getOrDefault(technology, Arrays.asList("G06F"));
        return classes.get(random.nextInt(classes.size())) + "/" + 
               (random.nextInt(99) + 1) + " " + 
               classes.get(random.nextInt(classes.size())) + "/" + 
               (random.nextInt(999) + 1);
    }
    
    private String generateCPCClasses(String technology) {
        return "Y02" + (random.nextInt(99) + 1) + "/" + (random.nextInt(99) + 1);
    }
    
    @Transactional
    public void generateTrademarks() {
        long currentCount = trademarkRepository.count();
        int needed = targetTrademarkSize - (int) currentCount;
        
        if (needed <= 0) {
            return;
        }
        
        System.out.println("Generating " + needed + " trademarks...");
        List<Trademark> trademarks = new ArrayList<>();
        
        String[] brands = {"Tech", "Innovate", "Global", "Smart", "Digital", "Future", "Prime", 
                           "Elite", "Core", "Vision", "NextGen", "Power", "Swift", "Bright"};
        String[] suffixes = {"Inc", "LLC", "Corp", "Ltd", "Solutions", "Technologies", "Systems"};
        
        for (int i = 0; i < needed; i++) {
            Trademark trademark = new Trademark();
            
            String brand = brands[random.nextInt(brands.length)];
            String suffix = suffixes[random.nextInt(suffixes.length)];
            String fullBrand = brand + suffix;
            
            trademark.setAssetNumber("TM-" + (1000000 + random.nextInt(9000000)));
            trademark.setMark(fullBrand);
            trademark.setTitle(fullBrand + " Trademark");
            trademark.setAssignee(fullBrand);
            trademark.setJurisdiction(jurisdictions.get(random.nextInt(jurisdictions.size())));
            trademark.setMarkType(random.nextDouble() < 0.7 ? "WORD" : "FIGURATIVE");
            trademark.setStatus(random.nextDouble() < 0.8 ? "REGISTERED" : "PENDING");
            trademark.setNiceClasses(String.valueOf(random.nextInt(45) + 1));
            trademark.setFilingDate(generateRandomDate(2015, 2025));
            trademark.setGoodsServices("Goods and services in class " + trademark.getNiceClasses());
            trademark.setIsCoreTrademark(random.nextDouble() < 0.05); // 5% are core
            
            trademarks.add(trademark);
            
            if (trademarks.size() >= 100) {
                trademarkRepository.saveAll(trademarks);
                trademarks.clear();
                System.out.print(".");
            }
        }
        
        if (!trademarks.isEmpty()) {
            trademarkRepository.saveAll(trademarks);
        }
        
        System.out.println("\n✅ Generated " + needed + " trademarks");
    }
}