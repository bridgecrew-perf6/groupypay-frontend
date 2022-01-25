import axios, { AxiosRequestHeaders, AxiosResponse, Method } from "axios";
import { GroupCreateProps, GroupPaymentProps, GroupProps, MemberPaymentProps, MemberProps, UserCreateProps, UserPatchProps, UserSignInProps } from "./interfaces";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://127.0.0.1:5000";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 *
 */
const errorByPGCode: any =  {
  "23505": "User under that email or phone number already exists",
}
export default class GroupypayApi {
  static token: string | null;

  static async request(endpoint: string, data = {}, method: Method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}${endpoint}`;
    const headers: AxiosRequestHeaders = { Authorization: `Bearer ${this.token}`, "Access-Control-Allow-Origin": BASE_URL};
    const params = (method === "get")
        ? data
        : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err: any) {
      console.error("API Error:", err.response);
      let message: string = err.response.data.error.pgcode ? errorByPGCode[err.response.data.error.pgcode] : err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }
  
  // User Routes
  static async signUp({ name, email, password, phoneNumber=undefined }: UserCreateProps) {
    const response: AxiosResponse = await this.request("/auth/sign-up", {name, email, password, phoneNumber}, "POST");
    console.log("data from signUp", response)
    return response.data
  }
  static async signIn({ email, password }: UserSignInProps) {
    const response: any = await this.request("/auth/token", {email, password}, "POST");
    console.log("data from signIn", response)
    return response
  }
  static async patchUser(email: string, user: UserPatchProps) {

    const response: AxiosResponse = await this.request(`/users/${email}`, user, "POST");
    console.log("data from patchUser", response.data)
    return response.data
  }
  static async getUser(email: string) {
    // Get a user using their email
    const response: AxiosResponse = await this.request(`/users/${email}`);
    console.log("data from getUser", response.data)
    return response.data
  }
  static async getUserGroups(email: string) {
    // Get a user's groups
    const response = await this.request(`/users/${email}/groups`);
    return response
  }
  static async makeGroup(email: string, group: GroupCreateProps) {
    // Make a group for a user
    const response: AxiosResponse = await this.request(`/users/${email}/groups`, group, "POST");
    return response
  }
  static async getGroup(id: string) {
    // Get a group using an id
    const response = await this.request(`/groups/${id}`);
    return response
  }
  static async addMember(groupId: string, member: MemberProps) {
    const response = await this.request(`/groups/${groupId}/members`, member, "POST");
    return response
  }
  static async addPayment(groupId: string, {name, total_amount}: GroupPaymentProps, memberPayments: MemberPaymentProps[]) {
    console.log("PAYMENT FROM API!!!", name, total_amount, memberPayments)
    const response = await this.request(`/groups/${groupId}/payments`, {name, total_amount, member_payments: memberPayments}, "POST");
    return response
  }
  static async getPayment(groupId: any, groupPaymentId: any) {
    console.log("PAYMENT FROM API!!!", groupPaymentId)
    const response = await this.request(`/groups/${groupId}/payments/${groupPaymentId}`);
    return response
  }
  
}

GroupypayApi.token = localStorage.getItem("token") && JSON.parse(localStorage.getItem("token") || "") ;