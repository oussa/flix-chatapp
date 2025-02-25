import { test, expect } from '@playwright/test';

test.describe('Chat App Tests', () => {
  test('Customer and Agent can exchange messages', async ({ browser }) => {
    // Create two browser contexts - one for customer, one for agent
    const customerContext = await browser.newContext();
    const agentContext = await browser.newContext();
    
    // Create pages for each context
    const customerPage = await customerContext.newPage();
    const agentPage = await agentContext.newPage();
    
    // 1. Customer: Navigate to the homepage and open chat
    await customerPage.goto('http://localhost:3000/');
    
    // Find and click the chat button to open the chat interface
    await customerPage.getByTestId('chat-button').click();
    
    // 2. Agent: Navigate to agent login page
    await agentPage.goto('http://localhost:3000/agent/login');
    
    // Login with credentials "agent" "agent"
    await agentPage.getByTestId('agent-email-input').fill('agent');
    await agentPage.getByTestId('agent-password-input').fill('agent');
    await agentPage.getByTestId('agent-login-button').click();
    
    // Verify agent is redirected to the dashboard
    await expect(agentPage).toHaveURL('http://localhost:3000/agent');
    
    // 3. Customer: Interact with the chat interface
    // Respond to the initial greeting
    await customerPage.getByTestId('customer-message-input').fill('Hello, I need help with my booking');
    await customerPage.getByTestId('customer-send-button').click();
    
    // Wait for the next question and provide email
    await customerPage.waitForTimeout(2000); // Wait for the next question
    await customerPage.getByTestId('customer-message-input').fill('customer@example.com');
    await customerPage.getByTestId('customer-send-button').click();
    
    // Wait for the next question and provide first name
    await customerPage.waitForTimeout(2000);
    await customerPage.getByTestId('customer-message-input').fill('John');
    await customerPage.getByTestId('customer-send-button').click();
    
    // Wait for the next question and provide last name
    await customerPage.waitForTimeout(2000);
    await customerPage.getByTestId('customer-message-input').fill('Doe');
    await customerPage.getByTestId('customer-send-button').click();
    
    // Wait for the next question and provide booking ID
    await customerPage.waitForTimeout(2000);
    await customerPage.getByTestId('customer-message-input').fill('B12345');
    await customerPage.getByTestId('customer-send-button').click();
    
    // 4. Wait for the conversation to appear in the agent dashboard
    // This may take some time as the customer conversation gets queued and processed
    await agentPage.waitForTimeout(5000);
    
    // Look for a conversation list item with the customer's name
    const conversationItem = agentPage.getByText('John Doe').first();
    await expect(conversationItem).toBeVisible({ timeout: 10000 });
    
    // 5. Agent: Select the conversation
    await conversationItem.click();
    
    // 6. Agent: Respond to the customer's initial message
    // Verify the agent sees the customer's messages in the selected conversation
    // Use the test ID for the chat area
    const agentChatArea = agentPage.getByTestId('agent-chat-area');
    await expect(agentChatArea.getByText('Hello, I need help with my booking')).toBeVisible({ timeout: 5000 });
    
    // Agent types and sends a response
    await agentPage.getByTestId('agent-message-input').fill('Hello John, I can see your booking B12345. How can I help you today?');
    await agentPage.getByTestId('agent-send-button').click();
    
    // 7. Customer: Verify they received the agent's message
    const customerChatArea = customerPage.getByTestId('customer-chat-area');
    await expect(customerChatArea.getByText('Hello John, I can see your booking B12345. How can I help you today?')).toBeVisible({ timeout: 5000 });
    
    // 8. Customer: Send an additional message
    await customerPage.getByTestId('customer-message-input').fill('I need to change my flight date to next week');
    await customerPage.getByTestId('customer-send-button').click();
    
    // 9. Agent: Verify they received the customer's new message
    // Use the test ID for the chat area
    await expect(agentChatArea.getByText('I need to change my flight date to next week')).toBeVisible({ timeout: 10000 });
    
    // 10. Agent: Respond to the customer's request
    await agentPage.getByTestId('agent-message-input').fill("I can help you with that. I've updated your booking to next week. You will receive a confirmation email shortly.");
    await agentPage.getByTestId('agent-send-button').click();
    
    // 11. Customer: Verify they received the confirmation
    await expect(customerChatArea.getByText("I can help you with that. I've updated your booking to next week. You will receive a confirmation email shortly.")).toBeVisible({ timeout: 5000 });
    
    // 12. Customer: Send a thank you message
    await customerPage.getByTestId('customer-message-input').fill('Thank you so much for your help!');
    await customerPage.getByTestId('customer-send-button').click();
    
    // 13. Agent: Verify they received the thank you message
    await expect(agentChatArea.getByText('Thank you so much for your help!')).toBeVisible({ timeout: 5000 });
    
    // 14. Agent: Mark the issue as resolved
    await agentPage.getByText('Mark Issue as Resolved').click();
    
    // 15. Agent: Confirm resolution in the dialog
    await agentPage.getByText('Yes, Mark as Resolved').click();
    
    // 16. Customer: Verify they see the resolution message
    await expect(customerChatArea.getByText('This conversation has been marked as resolved by the agent.')).toBeVisible({ timeout: 8000 });
    
    // Clean up
    await customerContext.close();
    await agentContext.close();
  });
});
