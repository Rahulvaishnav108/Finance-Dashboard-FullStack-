import fs from 'fs';
import path from 'path';

const messageTemplatesCache: Record<string, string> = {};

/**
 * Load and cache a text message template from src/templates/messages
 */
export function getMessageTemplate(templateName: string): string {
  if (messageTemplatesCache[templateName]) {
    return messageTemplatesCache[templateName];
  }

  const templatePath = path.join(__dirname, '..', 'templates', 'messages', `${templateName}.txt`);
  try {
    const content = fs.readFileSync(templatePath, 'utf-8');
    messageTemplatesCache[templateName] = content;
    return content;
  } catch (error) {
    throw new Error(`Message template ${templateName} not found at ${templatePath}`);
  }
}