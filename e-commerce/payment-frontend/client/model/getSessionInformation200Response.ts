/**
 * operon-demo-payment-backend
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: private
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models';
import { PaymentItem } from './paymentItem';

export class GetSessionInformation200Response {
    'sessionId': string;
    'successUrl': string;
    'cancelUrl': string;
    'status'?: string;
    'items': Array<PaymentItem>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "sessionId",
            "baseName": "session_id",
            "type": "string"
        },
        {
            "name": "successUrl",
            "baseName": "success_url",
            "type": "string"
        },
        {
            "name": "cancelUrl",
            "baseName": "cancel_url",
            "type": "string"
        },
        {
            "name": "status",
            "baseName": "status",
            "type": "string"
        },
        {
            "name": "items",
            "baseName": "items",
            "type": "Array<PaymentItem>"
        }    ];

    static getAttributeTypeMap() {
        return GetSessionInformation200Response.attributeTypeMap;
    }
}

