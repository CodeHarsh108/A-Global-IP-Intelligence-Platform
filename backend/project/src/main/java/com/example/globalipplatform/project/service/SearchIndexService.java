package com.example.globalipplatform.project.service;


import com.example.globalipplatform.project.entity.Patent;
import com.example.globalipplatform.project.repository.PatentRepository;
import jakarta.annotation.PostConstruct;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.*;
import org.apache.lucene.queryparser.classic.QueryParser; 
import org.apache.lucene.search.*;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class SearchIndexService {

    @Autowired
    private PatentRepository patentRepository;
    
    private Directory indexDirectory;
    private IndexReader indexReader;
    private IndexSearcher indexSearcher;
    private StandardAnalyzer analyzer;
    
    @PostConstruct
    public void init() {
        try {
            buildIndex();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    public void buildIndex() throws IOException {
        analyzer = new StandardAnalyzer();
        indexDirectory = new ByteBuffersDirectory();
        
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
        
        try (IndexWriter writer = new IndexWriter(indexDirectory, config)) {
            List<Patent> patents = patentRepository.findAll();
            
            for (Patent patent : patents) {
                Document doc = new Document();
                
                doc.add(new StringField("id", patent.getId().toString(), Field.Store.YES));
                doc.add(new TextField("title", patent.getTitle(), Field.Store.YES));
                doc.add(new TextField("abstract", patent.getAbstractText(), Field.Store.YES));
                doc.add(new TextField("assignee", patent.getAssignee(), Field.Store.YES));
                doc.add(new TextField("inventors", patent.getInventors(), Field.Store.YES));
                doc.add(new StringField("jurisdiction", patent.getJurisdiction(), Field.Store.YES));
                doc.add(new StringField("status", patent.getStatus(), Field.Store.YES));
                
                writer.addDocument(doc);
            }
        }
        
        indexReader = DirectoryReader.open(indexDirectory);
        indexSearcher = new IndexSearcher(indexReader);
    }
    
    public List<Long> search(String queryStr, int maxResults) throws Exception {
        QueryParser parser = new QueryParser("title", analyzer);
        Query query = parser.parse(queryStr);
        
        TopDocs topDocs = indexSearcher.search(query, maxResults);
        List<Long> results = new ArrayList<>();
        
        for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
            Document doc = indexSearcher.doc(scoreDoc.doc);
            results.add(Long.parseLong(doc.get("id")));
        }
        
        return results;
    }
    
    public void refreshIndex() throws IOException {
        if (indexReader != null) {
            indexReader.close();
        }
        indexReader = DirectoryReader.open(indexDirectory);
        indexSearcher = new IndexSearcher(indexReader);
    }
}