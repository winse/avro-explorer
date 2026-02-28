import {
  DataTable,
  DataViewerApp,
  SchemaView,
  ThemedDataViewer,
  useDataViewer,
} from 'data-viewer';
import React from 'react';

import 'data-viewer/styles';

import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';

const AvroApp: React.FC = () => {
  const data = useDataViewer('Avro');
  const { schema, records, header, filteredRecords } = data;

  return (
    <ThemedDataViewer>
      <DataViewerApp
        label="Avro"
        data={data}
        schemaPanel={
          schema && (
            <SchemaView
              schema={schema}
              extraInfo={
                <>
                  {schema.type && <span>Type: {schema.type}</span>}
                  {schema.name && <span>Name: {schema.name}</span>}
                </>
              }
            />
          )
        }
        recordsPanel={
          <DataTable
            records={records}
            header={header}
            filteredRecords={filteredRecords}
            schema={schema}
            enablePreview={true}
          />
        }
      />
    </ThemedDataViewer>
  );
};

export default AvroApp;
