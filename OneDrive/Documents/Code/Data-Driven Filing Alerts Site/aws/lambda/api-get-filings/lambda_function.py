#!/usr/bin/env python3
"""
API Lambda - Get Filings from DynamoDB
Returns bankruptcy filings for the React frontend
"""

import json
import logging
import os
from datetime import datetime, timedelta
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Key, Attr

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('TABLE_NAME', 'bankruptcy-filings-dev'))

class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert Decimal to int/float for JSON serialization"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    API Handler for getting bankruptcy filings
    
    Query params:
    - limit: number of items to return (default 50, max 200)
    - days: only return filings from last N days (default 90)
    - chapter: filter by chapter (7, 11, 13)
    - district: filter by district
    - industry: filter by industry
    """
    
    try:
        # Parse query params
        params = event.get('queryStringParameters') or {}
        limit = min(int(params.get('limit', 50)), 200)
        days = int(params.get('days', 90))
        chapter_filter = params.get('chapter')
        district_filter = params.get('district')
        industry_filter = params.get('industry')
        
        logger.info(f"Fetching filings: limit={limit}, days={days}, chapter={chapter_filter}, district={district_filter}")
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        start_date_str = start_date.strftime('%Y-%m-%d')
        
        # Scan with filters (we'll optimize with GSI later if needed)
        scan_kwargs = {
            'Limit': limit,
            'FilterExpression': Attr('filingDate').gte(start_date_str)
        }
        
        # Add optional filters
        if chapter_filter:
            scan_kwargs['FilterExpression'] = scan_kwargs['FilterExpression'] & Attr('chapter').eq(chapter_filter)
        
        if district_filter:
            scan_kwargs['FilterExpression'] = scan_kwargs['FilterExpression'] & Attr('district').contains(district_filter)
        
        if industry_filter:
            scan_kwargs['FilterExpression'] = scan_kwargs['FilterExpression'] & Attr('industry').eq(industry_filter)
        
        response = table.scan(**scan_kwargs)
        items = response.get('Items', [])
        
        # Transform for frontend
        filings = []
        for item in items:
            filing = {
                'id': item.get('caseNumber', ''),
                'debtorName': item.get('debtorName', 'Unknown'),
                'caseNumber': item.get('caseNumber', ''),
                'filedDate': item.get('filingDate', ''),
                'district': item.get('district', ''),
                'chapter': f"Chapter {item.get('chapter', '11')}",
                'assets': item.get('assets', 'Unknown'),
                'liabilities': item.get('liabilities', 'Unknown'),
                'creditors': item.get('creditors', 'Unknown'),
                'location': f"{item.get('city', '')}, {item.get('state', '')}".strip(', '),
                'industry': item.get('industry', 'Business'),
                'description': item.get('description', ''),
                'petitionLink': item.get('petitionLink', ''),
                'docketLink': item.get('docketLink', ''),
                'topCreditors': []
            }
            
            # Parse top creditors if available
            if 'topCreditors' in item and isinstance(item['topCreditors'], list):
                for cred in item['topCreditors'][:5]:
                    filing['topCreditors'].append({
                        'name': cred.get('name', 'Unknown'),
                        'amount': cred.get('amount', 'Unknown'),
                        'type': cred.get('type', 'Unsecured')
                    })
            
            filings.append(filing)
        
        # Sort by filing date (newest first)
        filings.sort(key=lambda x: x['filedDate'], reverse=True)
        
        logger.info(f"Returning {len(filings)} filings")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',  # Will restrict to Amplify domain later
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            'body': json.dumps({
                'filings': filings,
                'count': len(filings),
                'limit': limit,
                'days': days
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        logger.error(f"Error fetching filings: {e}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to fetch filings',
                'message': str(e)
            })
        }

