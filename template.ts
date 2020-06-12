import { html } from "./deps.ts";

export interface TemplateHeaders {
  [key: string]: {
    version: string;
  };
}

export interface TemplateTtesters {
  [key: string]: {
    [key: string]: {
      [key: string]: {
        path: string;
        code: string;
      };
    };
  };
}

export interface TemplateData {
  headers: TemplateHeaders;
  testers: TemplateTtesters;
  result: (nodeVersion: string, path: string) => string;
  percent: (nodeVersion: string) => number;
}

function renderHeaders(
  headers: TemplateHeaders,
  percent: (nodeVersion: string) => number,
): string {
  return Object.entries(headers)
    .map(([nodeVersion, details]) => {
      return html`
          <th class="version">${details.version}<sub>${percent(
        nodeVersion,
      )}%</sub></th>
      `;
    })
    .join("");
}

export function render({
  headers,
  testers,
  result,
  percent,
}: TemplateData): string {
  return html`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Web-Platform-Tests for Deno</title>
    <link href="favico.ico" rel="shortcut icon" />
    <link rel="stylesheet" href="style.css" />
  </head>
</html>
<body>
  <a
    class="github-fork"
    href="https://github.com/denodev/wpt"
    target="_blank"
    data-ribbon="Edit on GitHub"
    >Edit on GitHub</a
  >
  <header>
    <h1><a href="#top">Web-Platform-Tests for Deno</a></h1>
    <table class="headings">
      <tr>${renderHeaders(headers, percent)}</tr>
    </table>
  </header>
  <article id="top">
    ${Object.entries(testers)
    .map(([category, obj1]) => {
      const category2 = category.replace(/\W/g, "-");
      return html`
          <table class="results">
            <caption>
              <h2 class="category">
                <div class="hash" id="${category2}"></div>
                <a href="#${category2}">${category2}</a>
              </h2>
            </caption>
            ${Object.entries(obj1)
        .map(([subcategory, obj2]) => {
          const subcategory2 = [
            category2,
            subcategory.replace(/\W/g, "-"),
          ].join("-");
          return html`
                  <tr>
                    <td
                      class="feature sub"
                      colspan="${Object.keys(headers).length + 1}"
                    >
                      <h3>
                        <div class="hash" id="${subcategory2}"></div>
                        <a href="#${subcategory2}">${subcategory}</a>
                      </h3>
                    </td>
                  </tr>
                  ${Object.entries(obj2)
            .map(([subsubcategory, obj3]) => {
              const subsubcategory2 = [
                subcategory2,
                subsubcategory.replace(/\W/g, "-"),
              ].join("-");
              return html`
                        <tr>
                          <td class="feature subsub">
                            <div class="hash" id="${subsubcategory2}"></div>
                            <a href="#${subsubcategory2}"
                              >${subsubcategory}</a
                            >
                            <div class="info">
                              ?
                              <div class="fn">
                                <div class="code">${obj3.code}</div>
                              </div>
                            </div>
                          </td>
                          ${Object.keys(headers)
                .map(
                  (nodeVersion) =>
                    html`
                              <td class="result">
                                ${result(nodeVersion, obj3.path)}
                              </td>
                            `,
                )
                .join("")}
                        </tr>
                      `;
            })
            .join("")}
                `;
        })
        .join("")}
          </table>
        `;
    })
    .join("")}
  </article>
</body>`;
}
