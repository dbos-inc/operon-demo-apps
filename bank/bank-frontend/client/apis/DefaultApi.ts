/* tslint:disable */
/* eslint-disable */
/**
 * bank-backend
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  CreateAccountFuncRequest,
  Greeting200Response,
  ListAccountsFunc200ResponseInner,
  ListTxnForAccountFunc200ResponseInner,
} from '../models/index';
import {
    CreateAccountFuncRequestFromJSON,
    CreateAccountFuncRequestToJSON,
    Greeting200ResponseFromJSON,
    Greeting200ResponseToJSON,
    ListAccountsFunc200ResponseInnerFromJSON,
    ListAccountsFunc200ResponseInnerToJSON,
    ListTxnForAccountFunc200ResponseInnerFromJSON,
    ListTxnForAccountFunc200ResponseInnerToJSON,
} from '../models/index';

export interface CreateAccountFuncOperationRequest {
    createAccountFuncRequest: CreateAccountFuncRequest;
}

export interface ListAccountsFuncRequest {
    ownerName: string;
}

export interface ListTxnForAccountFuncRequest {
    accountId: number;
}

/**
 * 
 */
export class DefaultApi extends runtime.BaseAPI {

    /**
     */
    async createAccountFuncRaw(requestParameters: CreateAccountFuncOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ListAccountsFunc200ResponseInner>> {
        if (requestParameters.createAccountFuncRequest === null || requestParameters.createAccountFuncRequest === undefined) {
            throw new runtime.RequiredError('createAccountFuncRequest','Required parameter requestParameters.createAccountFuncRequest was null or undefined when calling createAccountFunc.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/create_account`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateAccountFuncRequestToJSON(requestParameters.createAccountFuncRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ListAccountsFunc200ResponseInnerFromJSON(jsonValue));
    }

    /**
     */
    async createAccountFunc(requestParameters: CreateAccountFuncOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListAccountsFunc200ResponseInner> {
        const response = await this.createAccountFuncRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async depositRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/deposit`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<string>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     */
    async deposit(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string> {
        const response = await this.depositRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async greetingRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Greeting200Response>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/greeting`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => Greeting200ResponseFromJSON(jsonValue));
    }

    /**
     */
    async greeting(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Greeting200Response> {
        const response = await this.greetingRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async internalTransferRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/transfer`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<string>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     */
    async internalTransfer(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string> {
        const response = await this.internalTransferRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async listAccountsFuncRaw(requestParameters: ListAccountsFuncRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ListAccountsFunc200ResponseInner>>> {
        if (requestParameters.ownerName === null || requestParameters.ownerName === undefined) {
            throw new runtime.RequiredError('ownerName','Required parameter requestParameters.ownerName was null or undefined when calling listAccountsFunc.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/list_accounts/{ownerName}`.replace(`{${"ownerName"}}`, encodeURIComponent(String(requestParameters.ownerName))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ListAccountsFunc200ResponseInnerFromJSON));
    }

    /**
     */
    async listAccountsFunc(requestParameters: ListAccountsFuncRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ListAccountsFunc200ResponseInner>> {
        const response = await this.listAccountsFuncRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async listTxnForAccountFuncRaw(requestParameters: ListTxnForAccountFuncRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ListTxnForAccountFunc200ResponseInner>>> {
        if (requestParameters.accountId === null || requestParameters.accountId === undefined) {
            throw new runtime.RequiredError('accountId','Required parameter requestParameters.accountId was null or undefined when calling listTxnForAccountFunc.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/transaction_history/{accountId}`.replace(`{${"accountId"}}`, encodeURIComponent(String(requestParameters.accountId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ListTxnForAccountFunc200ResponseInnerFromJSON));
    }

    /**
     */
    async listTxnForAccountFunc(requestParameters: ListTxnForAccountFuncRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ListTxnForAccountFunc200ResponseInner>> {
        const response = await this.listTxnForAccountFuncRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async withdrawRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/withdraw`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<string>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     */
    async withdraw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string> {
        const response = await this.withdrawRaw(initOverrides);
        return await response.value();
    }

}
