/* tslint:disable */
/* eslint-disable */
/**
 * social-ts
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { SendTimeline200ResponseTimelineInner } from './SendTimeline200ResponseTimelineInner';
import {
    SendTimeline200ResponseTimelineInnerFromJSON,
    SendTimeline200ResponseTimelineInnerFromJSONTyped,
    SendTimeline200ResponseTimelineInnerToJSON,
} from './SendTimeline200ResponseTimelineInner';

/**
 * 
 * @export
 * @interface SendTimeline200Response
 */
export interface SendTimeline200Response {
    /**
     * 
     * @type {string}
     * @memberof SendTimeline200Response
     */
    message: string;
    /**
     * 
     * @type {Array<SendTimeline200ResponseTimelineInner>}
     * @memberof SendTimeline200Response
     */
    timeline: Array<SendTimeline200ResponseTimelineInner>;
}

/**
 * Check if a given object implements the SendTimeline200Response interface.
 */
export function instanceOfSendTimeline200Response(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "message" in value;
    isInstance = isInstance && "timeline" in value;

    return isInstance;
}

export function SendTimeline200ResponseFromJSON(json: any): SendTimeline200Response {
    return SendTimeline200ResponseFromJSONTyped(json, false);
}

export function SendTimeline200ResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): SendTimeline200Response {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'message': json['message'],
        'timeline': ((json['timeline'] as Array<any>).map(SendTimeline200ResponseTimelineInnerFromJSON)),
    };
}

export function SendTimeline200ResponseToJSON(value?: SendTimeline200Response | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'message': value.message,
        'timeline': ((value.timeline as Array<any>).map(SendTimeline200ResponseTimelineInnerToJSON)),
    };
}

