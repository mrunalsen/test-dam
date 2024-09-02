const fs = require('fs');
const path = require('path');
const axios = require('axios');

const { UPLOADS_DIR } = require('../config/environment');
// Fetch SVGs from provided API
exports.fetchSVGsForProject = async (projectId, page, perPage, sort) => {
    console.log(projectId, page, perPage, sort);
    const response = await axios.post(` http://172.16.0.5:8088/api/project/${projectId}/icons`, {
        params: { page, perPage, sort }
    });

    const icons = response?.data?.result?.icons || [];

    const svgFiles = {};

    for (const icon of icons) {
        for (const iconImage of icon.iconImages) {
            const svgResponse = await axios.get(` http://172.16.0.5:8088/${iconImage.iconImagePath}`, {
                responseType: 'text'
            });
            svgFiles[iconImage.imageName] = svgResponse.data;
        }
    }

    return svgFiles;
};
exports.convertSVGsToComponents = async (svgFiles) => {
    const jsxComponents = [];
    const tsxComponents = [];
    const indexJsExports = [];
    const indexTsExports = [];
    const declarationFiles = [];

    const toPascalCase = (str) => {
        return str
            .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
            .replace(/^./, (c) => c.toUpperCase());
    };

    for (const fileName in svgFiles) {
        const svg = svgFiles[fileName];
        const baseFileName = toPascalCase(fileName.replace('.svg', ''));

        const cleanedSVG = svg.replace(/<svg[^>]*>/, (match) => {
            return match
                .replace(/\sid="[^"]*"/, '')
                .replace(/\sheight="[^"]*"/, '')
                .replace(/\swidth="[^"]*"/, '')
                .replace(/\sviewBox="[^"]*"/, ' viewBox="0 0 512 512"')
                .replace(/\senable-background="[^"]*"/, '')
                .replace(/\scolor="[^"]*"/, ' color="black"');
        });

        const jsxComponent = `
      import React from 'react';

      const ${baseFileName} = (props) => (
        ${cleanedSVG.replace('<svg', '<svg {...props}')}
      );

      export default ${baseFileName};
    `;

        const tsxComponent = `
      import * as React from "react";
      import type { SVGProps } from "react";

      interface IProps extends SVGProps<SVGSVGElement> {
        height: number | string;
        width: number | string;
      }

      const ${baseFileName}: React.FC<IProps> = (props) => {
        const { height, width, ...rest } = props;
        return (
          ${cleanedSVG.replace('<svg', `<svg height={height} width={width} {...rest}`)}
        );
      };

      export default ${baseFileName};
    `;

        const declarationFile = `
      import * as React from "react";
      import { SVGProps } from "react";

      export interface IProps extends SVGProps<SVGSVGElement> {
        height: number | string;
        width: number | string;
      }

      declare const ${baseFileName}: React.FC<IProps>;
      export default ${baseFileName};
    `;

        jsxComponents.push({ fileName: `${fileName.replace('.svg', '')}.jsx`, content: jsxComponent });
        tsxComponents.push({ fileName: `${fileName.replace('.svg', '')}.tsx`, content: tsxComponent });
        declarationFiles.push({ fileName: `${fileName.replace('.svg', '')}.d.ts`, content: declarationFile });
        indexJsExports.push(`export { default as ${baseFileName} } from "./${baseFileName}";`);
        indexTsExports.push(`export { default as ${baseFileName} } from "./${baseFileName}";`);
    }

    return { jsxComponents, tsxComponents, indexJsExports, indexTsExports, declarationFiles };
};

exports.toPascalCase = (str) => {
    return str
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^./, (c) => c.toUpperCase());
};