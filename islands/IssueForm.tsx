import type { LocalCommunity } from "$models/local-community.ts";
import { signal, useSignal } from "@preact/signals";
import type { ComponentChildren } from "https://esm.sh/preact@10.25.4/src/index.d.ts";
import { Form } from "../components/Form.tsx";
import { useTranslation } from "$hooks/useTranslation.ts";
import { IssueCategory } from "../routes/submit-issue.tsx";

interface IssueFormProps {
  categories: IssueCategory[];
  children?: ComponentChildren;
  communities: LocalCommunity[];
  issues: any[];
}

interface IssueFormState {
  localCommunity?: string;
  issueCategory?: string;
  issue?: string;
}

const state = signal<IssueFormState>({
  localCommunity: undefined,
  issueCategory: undefined,
  issue: undefined,
});

export function IssueForm(props: IssueFormProps) {
  const state = useSignal<IssueFormState>({
    localCommunity: undefined,
    issueCategory: undefined,
    issue: undefined,
  });

  const { t, fromObject } = useTranslation();

  return (
    <Form method="POST" action="/submit-issue">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">
          Create an Issue
        </legend>

        {JSON.stringify(state.value)}

        <select
          class="select validator"
          name="local_community"
          required
          onChange={(e) => {
            state.value = {
              ...state.value,
              localCommunity: e.currentTarget.value,
            };
          }}
        >
          <option readOnly disabled selected value="">
            {t("common.local_community")}
          </option>
          {props.communities.map((community) => (
            <option value={community.id} key={community.id}>
              {fromObject(community, "name")}
            </option>
          ))}
        </select>

        <select
          class="select validator"
          name="issue_category"
          required
          onChange={(e) =>
            state.value = {
              ...state.value,
              issueCategory: e.currentTarget.value,
            }}
        >
          <option readOnly disabled selected value="">
            Select a category
          </option>
          {props.categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          class="select validator"
          name="issue_type"
          required
          disabled={!state.value.issueCategory}
        >
          <option readOnly disabled selected value="">
            Select a issue
          </option>
          {props.issues
            .filter((issue) => issue.category === state.value.issueCategory)
            .map((issue) => (
              <option value={issue.id} key={issue.id}>
                {issue.name}
              </option>
            ))}
        </select>

        <textarea class="textarea" placeholder="note" name="note" />

        <button class="btn btn-primary" type="submit">Submit</button>
      </fieldset>
    </Form>
  );
}
