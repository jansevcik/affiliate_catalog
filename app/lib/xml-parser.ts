
import { XmlFormat } from '@prisma/client';

export interface ParsedProduct {
  externalId: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  originalUrl: string;
  imageUrl?: string;
  brand?: string;
  model?: string;
  sku?: string;
  ean?: string;
  availability?: string;
  condition?: string;
  shippingWeight?: number;
  category?: string;
  attributes: Array<{ name: string; value: string }>;
}

export class XmlParser {
  static async parseXml(xmlContent: string, format: XmlFormat): Promise<ParsedProduct[]> {
    try {
      switch (format) {
        case XmlFormat.GOOGLE_RSS:
          return this.parseGoogleRss(xmlContent);
        case XmlFormat.SHOPTET:
          return this.parseShoptet(xmlContent);
        default:
          throw new Error(`Unsupported XML format: ${format}`);
      }
    } catch (error) {
      console.error('XML parsing error:', error);
      throw new Error(`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static parseGoogleRss(xmlContent: string): ParsedProduct[] {
    const products: ParsedProduct[] = [];
    
    // Simple regex-based parsing for Google RSS format
    const itemMatches = xmlContent.match(/<item>([\s\S]*?)<\/item>/g);
    
    if (!itemMatches) {
      return products;
    }

    for (const itemXml of itemMatches) {
      try {
        const product: ParsedProduct = {
          externalId: this.extractValue(itemXml, 'g:id') || '',
          name: this.extractValue(itemXml, 'title') || '',
          description: this.extractCData(itemXml, 'description'),
          price: parseFloat(this.extractValue(itemXml, 'g:price')?.replace(/[^\d.]/g, '') || '0'),
          salePrice: this.extractValue(itemXml, 'g:sale_price') 
            ? parseFloat(this.extractValue(itemXml, 'g:sale_price')?.replace(/[^\d.]/g, '') || '0') 
            : undefined,
          originalUrl: this.extractValue(itemXml, 'link') || '',
          imageUrl: this.extractValue(itemXml, 'g:image_link'),
          brand: this.extractValue(itemXml, 'g:brand'),
          sku: this.extractValue(itemXml, 'g:id'),
          ean: this.extractValue(itemXml, 'g:gtin'),
          availability: this.extractValue(itemXml, 'g:availability'),
          condition: this.extractValue(itemXml, 'g:condition'),
          shippingWeight: this.extractValue(itemXml, 'g:shipping_weight') 
            ? parseFloat(this.extractValue(itemXml, 'g:shipping_weight')?.replace(/[^\d.]/g, '') || '0')
            : undefined,
          category: this.extractValue(itemXml, 'g:product_type'),
          attributes: []
        };

        // Add additional attributes
        const additionalFields = ['g:custom_label_2', 'g:adult', 'g:item_group_id'];
        for (const field of additionalFields) {
          const value = this.extractValue(itemXml, field);
          if (value) {
            product.attributes.push({
              name: field.replace('g:', ''),
              value: value
            });
          }
        }

        if (product.externalId && product.name) {
          products.push(product);
        }
      } catch (error) {
        console.error('Error parsing individual product:', error);
      }
    }

    return products;
  }

  private static parseShoptet(xmlContent: string): ParsedProduct[] {
    const products: ParsedProduct[] = [];
    
    // Simple regex-based parsing for Shoptet format
    const itemMatches = xmlContent.match(/<SHOPITEM>([\s\S]*?)<\/SHOPITEM>/g);
    
    if (!itemMatches) {
      return products;
    }

    for (const itemXml of itemMatches) {
      try {
        const product: ParsedProduct = {
          externalId: this.extractValue(itemXml, 'ITEM_ID') || '',
          name: this.extractValue(itemXml, 'PRODUCTNAME') || '',
          description: this.extractCData(itemXml, 'DESCRIPTION'),
          price: parseFloat(this.extractValue(itemXml, 'PRICE_VAT')?.replace(/[^\d.,]/g, '').replace(',', '.') || '0'),
          originalUrl: this.extractValue(itemXml, 'URL') || '',
          imageUrl: this.extractValue(itemXml, 'IMGURL'),
          brand: this.extractValue(itemXml, 'MANUFACTURER'),
          ean: this.extractValue(itemXml, 'EAN'),
          category: this.extractValue(itemXml, 'CATEGORYTEXT'),
          attributes: []
        };

        // Extract parameters/attributes
        const paramMatches = itemXml.match(/<PARAM>([\s\S]*?)<\/PARAM>/g);
        if (paramMatches) {
          for (const paramXml of paramMatches) {
            const name = this.extractValue(paramXml, 'PARAM_NAME');
            const value = this.extractValue(paramXml, 'VAL');
            if (name && value) {
              product.attributes.push({ name, value });
            }
          }
        }

        if (product.externalId && product.name) {
          products.push(product);
        }
      } catch (error) {
        console.error('Error parsing individual product:', error);
      }
    }

    return products;
  }

  private static extractValue(xml: string, tag: string): string | undefined {
    const regex = new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : undefined;
  }

  private static extractCData(xml: string, tag: string): string | undefined {
    const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`, 'i');
    const match = xml.match(regex);
    if (match) {
      return match[1].trim();
    }
    
    // Fallback to regular extraction
    return this.extractValue(xml, tag);
  }
}
