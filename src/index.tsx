import ForgeUI, {
  render,
  Fragment,
  Text,
  IssuePanel,
  useProductContext,
  useState,
} from "@forge/ui";
import api, { route, fetch, FetchOptions } from "@forge/api";
import { JiraComment, JiraContext } from "./types";

const App = () => {
  const context = useProductContext();
  const jiraContext = context.platformContext as JiraContext;
  const issuekey = jiraContext.issueKey;

  const [comments] = useState(async () => await getComments(issuekey));
  const prompt = `Here is a sample data where all the comments of a jira issue is joined together: 
  "${comments}". I want to summarize this in a way that anybody can get an idea what's going on in this issue without going through all the comments. Create a summary or TLDR for this. don't add anything else`
  const [summary] = useState(async () => await callOpenAI(prompt));

  return (
    <Fragment>
      <Text>{summary}</Text>
    </Fragment>
  );
};

export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>
);

const getComments = async (issuekey:string) => {
  const responseData = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${issuekey}/comment`, {
      headers: {
        Accept: "application/json",
      },
    });

  const commentsData = await responseData.json();
  const jsonData = await commentsData.comments;

  let extractedTexts = [];
  await jsonData.map((comment:JiraComment) => {
    if (comment.body && comment.body.content) {
      comment.body.content.map((contentItem) => {
        if (contentItem.type === "paragraph" && contentItem.content) {
          contentItem.content.map((textItem) => {
            if (textItem.type === "text" && textItem.text) {
              extractedTexts.push(textItem.text);
            }
          });
        }
      });
    }
  });
  return extractedTexts.join("");
};


const callOpenAI = async (prompt:string) => {
  const choiceCount = 1;
  const url = `https://api.openai.com/v1/chat/completions`;

  const payload = {
    model: "gpt-3.5-turbo",
    n: choiceCount,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  const options: FetchOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPEN_API_KEY}`,
      "Content-Type": `application/json`,
    },
    redirect: "follow",
    body:JSON.stringify(payload)
  };

  const response = await fetch(url, options);
  const chatcompletion = await response.json();
  let result = "";
  if ((response.status = 200)) {
    const chatcompletion = await response.json();
    const firstChoise = chatcompletion.choices[0];
    if (firstChoise) {
      result = firstChoise.message.content;
    } else {
      console.warn(
        `chat completion response did not include  any assistance  choices.`
      );
      result = `AI response did not include any choices.`;
    }
  } else {
    const text = await response.text();
    result = text;
  }
  return result;
};
