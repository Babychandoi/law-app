package org.law_app.backend.service;

public interface ChatbotAIService {
    /**
     * Generate AI response for guest message
     * @param guestId Guest identifier
     * @param message Guest's message
     * @return AI generated response
     */
    String generateResponse(String guestId, String message);
    
    /**
     * Check if AI should respond (no admin has taken over)
     * @param guestId Guest identifier
     * @return true if AI should respond
     */
    boolean shouldAIRespond(String guestId);
    
    /**
     * Disable AI for this conversation (admin takes over)
     * @param guestId Guest identifier
     */
    void disableAIForGuest(String guestId);
    
    /**
     * Enable AI for this conversation
     * @param guestId Guest identifier
     */
    void enableAIForGuest(String guestId);
}
