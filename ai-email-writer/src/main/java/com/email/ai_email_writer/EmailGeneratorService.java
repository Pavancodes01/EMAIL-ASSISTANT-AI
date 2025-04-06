package com.email.ai_email_writer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Value("${gemini.api.url}")
    private String geminiApiUri;

    @Value("${gemini.api.key}")
    private String geminiApiKey;



    public String generateEmailReply(EmailRequest emailRequest) {

        //Build the prompt
        String prompt = buildPrompt(emailRequest);

        //Craft a Request
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                }
        );

        //Do request and get response
       String response=webClient.post().uri(geminiApiUri + geminiApiKey)
               .header("Content-Type","application/json")
               .bodyValue(requestBody)
               .retrieve().bodyToMono(String.class).block();

        //Extract Response and Return
        return extractResponseContent(response);

    }

    private String extractResponseContent(String respone) {
        try {
            ObjectMapper mapper=new ObjectMapper();
            JsonNode rootNode=mapper.readTree(respone);
            return rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        }catch (Exception e){
            return "Error processing request: "+e.getMessage();
        }
    }


    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt=new StringBuilder();
        prompt.append("Generate a professional email content. Please don't generate a subject line");
        if (emailRequest.getTone()!=null && !emailRequest.getTone().isEmpty()){
            prompt.append("Use a").append(emailRequest.getTone()).append(" tone. ");
        }
        prompt.append("\nOriginal email: \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }

}

