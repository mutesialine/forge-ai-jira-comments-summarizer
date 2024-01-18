import { PlatformContext } from "@forge/ui/out/types";

export interface JiraContext extends PlatformContext {
  type: "jira";
  issueId: string;
  issueKey: string;
  issueType: string;
  projectId: string;
  projectKey: string;
  projectType: string;
}

interface JiraIssueComment {
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: JiraComment[];
}

export interface JiraComment {
  self: string;
  id: string;
  author: {
    self: string;
    accountId: string;
    displayName: string;
    active: boolean;
  };
  body: {
    type: string;
    version: number;
    content: JiraContent[];
  };
  updateAuthor: {
    self: string;
    accountId: string;
    displayName: string;
    active: boolean;
  };
  created: string;
  updated: string;
  visibility: {
    type: string;
    value: string;
    identifier: string;
  };
}

interface JiraContent {
  type: string;
  content: JiraParagraph[];
}

interface JiraParagraph {
  type: string;
  text: string;
  content: JiraText[];
}

interface JiraText {
  type: string;
  text: string;
}
